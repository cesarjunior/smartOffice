var clientes = {
    table: 'clientes',
    primaryKey: 'id',
    returnRegisters: [],
    modeloAppend: '',
    init: function () {
        $('#btn_iniciarModulo_clientes').on('click', this.carregarListaRegistros);
        $('#btn_salvar_formularioClientes').on('click', this.salvarFormularioClientes);
        $('#btn_cancelar_formularioClientes').on('click', this.rezeteFormularioClientes);
        $('#btn_voltar_formularioClientes').on('click', this.rezeteFormularioClientes);
        linkTeste = '#clientes?id=2';
        console.log(location);
    },
    salvarFormularioClientes: function () {
        params = {
            columns: [],
            values: []
        };

        $('#modelClientes_formulario input').each(function () {
            if ($(this).val() != '') {
                params.columns.push($(this).attr('name'));
                params.values.push($(this).val());
            }
        });

        app.saveRegister(clientes, params, function () {
            app.showMensagem('Registro salvo com sucesso.');
            clientes.carregarListaRegistros();
            clientes.rezeteFormularioClientes();
        });
        return false;
    },
    carregarListaRegistros: function (callback) {
        //app.openLoader();
        if (clientes.modeloAppend == '') {
            clientes.modeloAppend = $("#listviewClientes").html();
        }
        app.getRegisters(clientes, {order: 'nome ASC'}, function (resultArray) {
            $('#listviewClientes').empty();
            if (resultArray.length) {
                $.each(resultArray, function (index, val) {
                    conteudoAppend = clientes.modeloAppend.replace('{NOME}', val.nome);
                    conteudoAppend = conteudoAppend.replace('{DOCUMENTO}', val.documento);
                    conteudoAppend = conteudoAppend.replace('{TELEFONE}', val.telefone);
                    conteudoAppend = conteudoAppend.replace('{LINK-EDITA-REGISTRO}', '?id=' + val.id + '#formularioCliente');
                    $('#listviewClientes').append(conteudoAppend);
                });

                $('.dropdown').off('click');
                $('.dropdown').on('click', app.dropdownToggle);
                /*
                 $('#listviewClientes li .editarCliente').off('tap');
                 $('#listviewClientes li .editarCliente').on('tap', function () {
                 indexArray = parseInt($(this).attr('indexArray'));
                 parameters = resultArray[indexArray];
                 $('#formulario_pageFormClientes input[name="id"]').val(parameters.id);
                 $('#formulario_pageFormClientes input[name="nome"]').val(parameters.nome);
                 $('#formulario_pageFormClientes input[name="documento"]').val(parameters.documento);
                 $('#formulario_pageFormClientes input[name="telefone"]').val(parameters.telefone);
                 $('#formulario_pageFormClientes input[name="endereco"]').val(parameters.endereco);
                 $('#formulario_pageFormClientes input[name="bairro"]').val(parameters.bairro);
                 $('#formulario_pageFormClientes input[name="cidade"]').val(parameters.cidade);
                 $('#formulario_pageFormClientes input[name="estado"]').val(parameters.estado);
                 $('#formulario_pageFormClientes input[name="cep"]').val(parameters.cep);
                 $('#formulario_pageFormClientes textarea[name="observacao"]').val(parameters.observacao);
                 });
                 
                 $('#listviewClientes li a[href="delete"]').off('tap');
                 $('#listviewClientes li a[href="delete"]').on('tap', function () {
                 if (confirm('Deseja realmente excluir este item ?')) {
                 app.deleteRegister(clientes, $(this).attr('id'), function () {
                 clientes.carregarListaRegistros();
                 });
                 }
                 return false;
                 });
                 */
            } else {
                $('#listviewClientes').append('<li>Nenhum registro localizado no momento.</li>');
            }
            //app.closeLoader();
            if (typeof callback == 'function') {
                callback();
            }
        });
    },
    rezeteFormularioClientes: function () {
        $('#modelClientes_formulario input').each(function (index) {
            $(this).val('');
        });
        $(location).attr('href', '#clientes');
        return false;
    }
}