var produtos = {
    modeloAppend: '',
    init: function () {
        $('#btn_iniciarModulo_produtos').on('click', this.carregarListaRegistros);
    },
    carregarListaRegistros: function (callback) {

        if (produtos.modeloAppend == '') {
            clientes.modeloAppend = $("#listviewProdutos").html();
        }

        app.fetchRegisters({table: 'produtos', order: 'produto ASC'}, function (resultArray) {
            $('#listviewProdutos').empty();
            if (resultArray.length) {
                $.each(resultArray, function (index, val) {
                    conteudoAppend = clientes.modeloAppend.replace('{produto}', val.produto);
                    //conteudoAppend = conteudoAppend.replace('{DOCUMENTO}', val.documento ? val.documento : '');
                    //conteudoAppend = conteudoAppend.replace('{TELEFONE}', val.telefone ? val.telefone : '');
                    conteudoAppend = conteudoAppend.replace(/{ID-REGISTRO}/g, val.id);
                    $('#listviewProdutos').append(conteudoAppend);
                });

                $('.dropdown').off('click');
                $('.dropdown').on('click', app.dropdownToggle);

                //$('.btn_editar_clientes').off('click');
                //$('.btn_editar_clientes').on('click', clientes.populateFormularioCliente);


                //$('.btn_deletar_cliente').off('click');
                //$('.btn_deletar_cliente').on('click', clientes.deleteCliente);

            } else {
                $('#listviewProdutos').append('<li>Nenhum registro localizado no momento.</li>');
            }
            //app.closeLoader();
            if (typeof callback == 'function') {
                callback();
            }
        });
    },
    rezetePageFormProdutos: function () {
        $('#formulario_pageFormProdutos input[name="id"]').val('');
        $('#formulario_pageFormProdutos input[name="produto"]').val('');
        $('#formulario_pageFormProdutos input[name="valor_venda"]').val('');
        $('#formulario_pageFormProdutos input[name="estoque"]').val('');
        $('#formulario_pageFormProdutos textarea[name="observacao"]').val('');
    }
}