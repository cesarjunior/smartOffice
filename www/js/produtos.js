var produtos = {
    modeloAppend: '',
    init: function () {
        $('#btn_iniciarModulo_produtos').on('click', this.carregarListaRegistros);
        $('#btn_salvar_formularioProduto').on('click', this.salvarFormularioProduto);
        $('#btn_cancelar_formularioProduto').on('click', this.rezeteFormularioProduto);
        $('#btn_voltar_formularioProdutos').on('click', this.rezeteFormularioProduto);
        $('#precoVenda').on('change keyup', app.maskMoney);
    },
    salvarFormularioProduto: function () {
        params = {
            table: 'produtos',
            columns: [],
            values: []
        };

        $('#modelProdutos_formulario input').each(function () {
            if ($(this).val() != '') {
                params.columns.push($(this).attr('name'));
                if ($(this).attr('name') == 'valor_venda') {
                    params.values.push(app.formatPrice($(this).val(), 1));
                } else {
                    params.values.push($(this).val());
                }
            }
        });

        app.saveRegister(params, function () {
            app.showMensagem('Registro salvo com sucesso.');
            produtos.carregarListaRegistros();
            produtos.rezeteFormularioProduto();
        });
        return false;
    },
    carregarListaRegistros: function (callback) {

        if (produtos.modeloAppend == '') {
            produtos.modeloAppend = $("#listviewProdutos").html();
        }

        app.fetchRegisters({table: 'produtos', order: 'produto ASC'}, function (resultArray) {
            $('#listviewProdutos').empty();
            if (resultArray.length) {
                $.each(resultArray, function (index, val) {
                    conteudoAppend = produtos.modeloAppend.replace('{PRODUTO}', val.produto);
                    //conteudoAppend = conteudoAppend.replace('{DOCUMENTO}', val.documento ? val.documento : '');
                    //conteudoAppend = conteudoAppend.replace('{TELEFONE}', val.telefone ? val.telefone : '');
                    conteudoAppend = conteudoAppend.replace(/{ID-REGISTRO}/g, val.id);
                    $('#listviewProdutos').append(conteudoAppend);
                });

                $('.dropdown').off('click');
                $('.dropdown').on('click', app.dropdownToggle);

                $('.btn_editar_produtos').off('click');
                $('.btn_editar_produtos').on('click', produtos.populateFormularioProduto);


                $('.btn_deletar_produtos').off('click');
                $('.btn_deletar_produtos').on('click', produtos.deleteProduto);

            } else {
                $('#listviewProdutos').append('<li>Nenhum registro localizado no momento.</li>');
            }
            //app.closeLoader();
            if (typeof callback == 'function') {
                callback();
            }
        });
    },
    populateFormularioProduto: function () {
        app.findRegister('produtos', $(this).attr('data-id'), function (result) {
            $.each(result, function (index, val) {
                if (val != '') {
                    if (index == 'valor_venda') {
                        $('#modelProdutos_formulario input[name="' + index + '"]').val(app.formatPrice(val, 2));
                    } else {
                        $('#modelProdutos_formulario input[name="' + index + '"]').val(val);
                    }
                }
            });
        });
    },
    deleteProduto: function () {
        if (confirm('Deseja realmente excluir este item ?')) {
            app.deleteRegister('produtos', $(this).attr('data-id'), function () {
                app.showMensagem('Registro removido com sucesso.');
                produtos.carregarListaRegistros();
            });
        }
        return false;
    },
    rezeteFormularioProduto: function () {
        $('#modelProdutos_formulario input').each(function () {
            $(this).val('');
        });
        window.history.back();
        return false;
    }
}