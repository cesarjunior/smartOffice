var pedidos = {
    modeloAppend: '',
    modeloAppendItens: '',
    modeloItensPedido: '',
    pedidoItens: [],
    findIndexItem: false,
    init: function () {
        $('#btn_iniciarModulo_pedidos').on('click', this.carregarListaRegistros);
        $('.btn_openWindow_formularioPedido').on('click', function () {
            pedidos.populateSelectClientes();
            pedidos.loadListPedidoItens();
        });
        $('#btn_cancelar_formularioPedido, #btn_voltar_formularioPedido').on('click', this.rezeteFormularioPedido);
        $('#btn_cancelar_formularioPedidoAdicionarItem, #btn_voltar_formularioPedidoAdicionarItem').on('click', this.rezeteFormularioPedidoAdicionarItem);
        $('#btn_voltar_formularioPedidoEscolheItem').on('click', function () {
            window.history.back();
        });
        $('#btn_openWindow_escolherItem').on('click', this.loadListAdicionarProdutos);
        $('.maskMoney').on('change keyup', app.maskMoney);
        $('#calculaQuantidade').on('change keyup', this.calculaQuantidadeAdicionar);
        $('#btn_salvar_formularioPedidoAdicionarItem').on('click', this.action_adicionarItemEscolhido);
    },
    carregarListaRegistros: function (callback) {
        if (pedidos.modeloAppend == '') {
            pedidos.modeloAppend = $("#listviewPedidos").html();
        }
        sql = "SELECT p.*, c.nome FROM pedidos AS p INNER JOIN clientes AS c ON p.fk_id_cliente = c.id ORDER BY p.id DESC";
        app.fetchRegisters(sql, function (resultArray) {
            $('#listviewPedidos').empty();
            if (resultArray.length) {
                $.each(resultArray, function (index, val) {
                    conteudoAppend = pedidos.modeloAppend.replace('{CLIENTE}', val.nome);
                    conteudoAppend = conteudoAppend.replace(/{ID-REGISTRO}/g, val.id);
                    $('#listviewPedidos').append(conteudoAppend);
                });

                //$('.dropdown').off('click');
                //$('.dropdown').on('click', app.dropdownToggle);

                //$('.btn_editar_produtos').off('click');
                //$('.btn_editar_produtos').on('click', produtos.populateFormularioProduto);

                $('.actionPopulateClientes').off('click');
                $('.actionPopulateClientes').on('click', pedidos.populateSelectClientes);


                //$('.btn_deletar_produtos').off('click');
                //$('.btn_deletar_produtos').on('click', produtos.deleteProduto);

            } else {
                $('#listviewPedidos').append('<li>Nenhum registro localizado no momento.</li>');
            }
            if (typeof callback == 'function') {
                callback();
            }
        });
    },
    populateSelectClientes: function () {
        app.fetchRegisters({table: 'clientes', order: 'nome ASC'}, function (resultArray) {
            $('#modelPedidos_formulario select option[value!=""]').detach();
            $.each(resultArray, function (index, val) {
                if ($(this).attr('data-id') == val.id) {
                    selected = 'selected="selected"';
                } else {
                    selected = '';
                }
                $("#modelPedidos_formulario select[name='cliente']").append('<option value="' + val.id + '" ' + selected + '>' + val.nome + '</option>');
            });
        });
    },
    loadListAdicionarProdutos: function (callback) {
        if (pedidos.modeloAppendItens == '') {
            pedidos.modeloAppendItens = $("#listviewPedidoEscolheItem").html();
        }

        app.fetchRegisters({table: 'produtos', order: 'produto ASC'}, function (resultArray) {
            $('#listviewPedidoEscolheItem').empty();
            if (resultArray.length) {
                $.each(resultArray, function (index, val) {
                    conteudoAppend = pedidos.modeloAppendItens.replace('{PRODUTO}', val.produto);
                    conteudoAppend = conteudoAppend.replace(/{ID-REGISTRO}/g, val.id);
                    $('#listviewPedidoEscolheItem').append(conteudoAppend);
                });

                $('.btn_openWindow_adicionarItem').off('click');
                $('.btn_openWindow_adicionarItem').on('click', pedidos.action_itemEscolhido);

            } else {
                $('#listviewPedidoEscolheItem').append('<li>Nenhum registro localizado no momento.</li>');
            }
            if (typeof callback == 'function') {
                callback();
            }
        });
    },
    loadListPedidoItens: function () {
        if (pedidos.modeloItensPedido == '') {
            pedidos.modeloItensPedido = $("#listviewItensDoPedido").html();
        }

        $('#listviewItensDoPedido').empty();
        if (pedidos.pedidoItens.length != 0) {
            $.each(pedidos.pedidoItens, function (index, value) {
                conteudoAppend = pedidos.modeloItensPedido.replace('{PRODUTO}', value.produto);
                conteudoAppend = conteudoAppend.replace('{QUANTIDADE}', value.quantidade);
                conteudoAppend = conteudoAppend.replace('{VALOR_UNITARIO}', value.valor_unitario);
                conteudoAppend = conteudoAppend.replace('{VALOR_TOTAL}', value.valor_total);
                conteudoAppend = conteudoAppend.replace(/{indexArray}/g, index);
                $('#listviewItensDoPedido').append(conteudoAppend);
            });

            $('.dropdown').off('click');
            $('.dropdown').on('click', app.dropdownToggle);

            $('.btn_deletar_itemDoPedido').off('click');
            $('.btn_deletar_itemDoPedido').on('click', pedidos.removerItemPedido);

        } else {
            $('#listviewItensDoPedido').append('<li>Nenhum item adicionado no momento.</li>');
        }
    },
    action_itemEscolhido: function () {
        history.pushState(null, null, '#formularioPedidoAdicionarItem');
        app.displayContainer();

        $this = this;

        $.each(pedidos.pedidoItens, function (index, value) {
            if (value.fk_id_produto == $($this).attr('data-id')) {
                pedidos.findIndexItem = index;
            }
        });



        if (pedidos.findIndexItem === false) {
            app.findRegister('produtos', $(this).attr('data-id'), function (result) {
                $('#modelPedidos_formularioAdicionarItem input[name="fk_id_produto"]').val(result.id);
                $('#modelPedidos_formularioAdicionarItem input[name="produto"]').val(result.produto);
                $('#modelPedidos_formularioAdicionarItem input[name="valor_unitario"]').val(app.formatPrice(result.valor_venda, 2));
            });
        } else {
            $('#modelPedidos_formularioAdicionarItem input[name="fk_id_produto"]').val(pedidos.pedidoItens[pedidos.findIndexItem].fk_id_produto);
            $('#modelPedidos_formularioAdicionarItem input[name="produto"]').val(pedidos.pedidoItens[pedidos.findIndexItem].produto);
            $('#modelPedidos_formularioAdicionarItem input[name="valor_unitario"]').val(pedidos.pedidoItens[pedidos.findIndexItem].valor_unitario);
            $('#modelPedidos_formularioAdicionarItem input[name="quantidade"]').val(pedidos.pedidoItens[pedidos.findIndexItem].quantidade);
            $('#modelPedidos_formularioAdicionarItem input[name="valor_total"]').val(pedidos.pedidoItens[pedidos.findIndexItem].valor_total);
        }
    },
    removerItemPedido: function () {
        pedidos.pedidoItens.splice($(this).attr('data-index'), 1);
        pedidos.loadListPedidoItens();
        app.showMensagem('Item removido com sucesso');
        return false;
    },
    calculaQuantidadeAdicionar: function () {
        if ($(this).val() != '') {
            quantidade = parseInt($(this).val());
            valorUnitario = app.formatPrice($('#calculaValorUnitario').val(), 1);
            valorTotal = quantidade * valorUnitario;
            $('#calculaValorTotal').val(app.formatPrice(valorTotal, 2));
        } else {
            $('#calculaValorTotal').val('0,00');
        }
    },
    action_adicionarItemEscolhido: function () {
        if (pedidos.findIndexItem === false) {
            indexArray = pedidos.pedidoItens.length;
        } else {
            indexArray = pedidos.findIndexItem;
        }
        pedidos.pedidoItens[indexArray] = {
            fk_id_produto: $('#modelPedidos_formularioAdicionarItem input[name="fk_id_produto"]').val(),
            produto: $('#modelPedidos_formularioAdicionarItem input[name="produto"]').val(),
            valor_unitario: $('#modelPedidos_formularioAdicionarItem input[name="valor_unitario"]').val(),
            quantidade: $('#modelPedidos_formularioAdicionarItem input[name="quantidade"]').val(),
            valor_total: $('#modelPedidos_formularioAdicionarItem input[name="valor_total"]').val()
        }
        pedidos.loadListPedidoItens();
        pedidos.findIndexItem = false;
        $('#modelPedidos_formularioAdicionarItem input').each(function () {
            $(this).val('');
        });
        window.history.go(-2);
        return false;
    },
    rezeteFormularioPedido: function () {
        $('#modelPedidos_formulario input').each(function () {
            $(this).val('');
        });
        pedidos.pedidoItens = [];
        window.history.back();
        return false;
    },
    rezeteFormularioPedidoAdicionarItem: function () {
        $('#modelPedidos_formularioAdicionarItem input').each(function () {
            $(this).val('');
        });
        pedidos.findIndexItem = false;
        window.history.back();
        return false;
    }
}