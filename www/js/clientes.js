var clientes = {
    table: 'clientes',
    primaryKey: 'id',
    returnRegisters: [],
    init: function () {
        $('#btn_iniciarModulo_clientes').on('tap', this.carregarListaRegistros);
        $('#btn_salvar_pageFormClientes').on('tap', this.salvarFormularioClientes);
        $('#btn_cancelar_pageFormClientes').on('tap', this.rezetePageFormClientes);
    },
    salvarFormularioClientes: function () {
        params = {
            columns: [
                'nome',
                'documento',
                'telefone',
                'endereco',
                'bairro',
                'cidade',
                'estado',
                'cep',
                'observacao',
                'id'
            ],
            values: [
                $('#formulario_pageFormClientes input[name="nome"]').val(),
                $('#formulario_pageFormClientes input[name="documento"]').val(),
                $('#formulario_pageFormClientes input[name="telefone"]').val(),
                $('#formulario_pageFormClientes input[name="endereco"]').val(),
                $('#formulario_pageFormClientes input[name="bairro"]').val(),
                $('#formulario_pageFormClientes input[name="cidade"]').val(),
                $('#formulario_pageFormClientes input[name="estado"]').val(),
                $('#formulario_pageFormClientes input[name="cep"]').val(),
                $('#formulario_pageFormClientes textarea[name="observacao"]').val(),
                $('#formulario_pageFormClientes input[name="id"]').val()
            ]

        };
        app.saveRegister(clientes, params, function () {
            clientes.carregarListaRegistros();
            clientes.rezetePageFormClientes();
        });
    },
    carregarListaRegistros: function (callback) {
        app.openLoader();
        app.getRegisters(clientes, {order: 'nome ASC'}, function (resultArray) {
            $('#listviewClientes').empty();
            if (resultArray.length) {
                $.each(resultArray, function (index, val) {
                    $('#listviewClientes').append('<li><a href="#page_formClientes" class="editarCliente" id="' + val.id + '" indexArray="' + index + '"><h2>' + val.nome + '</h2></a><a href="delete" id="' + val.id + '" indexArray="' + index + '">Delete</a></li>');
                });
                $("#listviewClientes").listview('refresh');

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
            } else {
                $('#listviewClientes').append('<li>Nenhum registro localizado no momento.</li>');
            }
            app.closeLoader();
            if (typeof callback == 'function') {
                callback();
            }
        });
    },
    rezetePageFormClientes: function () {
        $('#formulario_pageFormClientes input[name="id"]').val('');
        //$('#formulario_pageFormClientes input[name="pessoa"] option[value="pj"]').attr('selected','selected');
        $('#formulario_pageFormClientes input[name="nome"]').val('');
        $('#formulario_pageFormClientes input[name="documento"]').val('');
        $('#formulario_pageFormClientes input[name="telefone"]').val('');
        $('#formulario_pageFormClientes input[name="endereco"]').val('');
        $('#formulario_pageFormClientes input[name="bairro"]').val('');
        $('#formulario_pageFormClientes input[name="cidade"]').val('');
        $('#formulario_pageFormClientes input[name="estado"]').val('');
        $('#formulario_pageFormClientes input[name="cep"]').val('');
        $('#formulario_pageFormClientes textarea[name="observacao"]').val('');
    }
}