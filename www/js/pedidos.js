var pedidos = {
    modeloAppend: '',
    modeloAppendItens: '',
    modeloItensPedido: '',
    pedidoItens: [],
    findIndexItem: false,
    init: function () {
        $('#btn_iniciarModulo_pedidos').on('click', this.carregarListaRegistros);
        $('.btn_openWindow_formularioPedido').on('click', pedidos.actionOpenWindow_formularioPedido);
        $('#btn_salvar_formularioPedido').on('click', this.salvarFormularioPedido);
        $('#btn_cancelar_formularioPedido, #btn_voltar_formularioPedido').on('click', this.rezeteFormularioPedido);
        $('#btn_voltar_formularioPedidoEscolheItem').on('click', function () {
            window.history.back();
        });
        $('#btn_openWindow_escolherItem').on('click', this.loadListAdicionarProdutos);
        $('.maskMoney').on('change keyup', app.maskMoney);
        $('#calculaQuantidade').on('change keyup', this.calculaQuantidadeAdicionar);
        $('#btn_cancelar_formularioPedidoAdicionarItem, #btn_voltar_formularioPedidoAdicionarItem').on('click', this.rezeteFormularioPedidoAdicionarItem);
        $('#btn_salvar_formularioPedidoAdicionarItem').on('click', this.action_adicionarItemEscolhido);
    },
    salvarFormularioPedido: function () {
        params = {
            table: 'pedidos',
            columns: ['data_pedido', 'fk_id_cliente', 'valor_total', 'entregue'],
            values: [
                $('#modelPedidos_formulario input[name="data_pedido"]').val(),
                $('#modelPedidos_formulario select[name="cliente"]').val(),
                app.formatPrice($('#modelPedidos_formulario input[name="valor_total"]').val(), 1),
                '0'
            ]
        };

        if ($('#modelPedidos_formulario input[name="id"]').val() != '') {
            params.columns.push('id');
            params.values.push($('#modelPedidos_formulario input[name="id"]').val());
        }


        app.saveRegister(params, function (idPedido) {
            if (pedidos.pedidoItens.length > 0) {
                db.transaction(function (tx) {
                    sql = "DELETE FROM pedidos_itens WHERE fk_id_pedido = " + idPedido;
                    tx.executeSql(sql, [], function () {
                        pedidos.carregarListaRegistros();
                        $.each(pedidos.pedidoItens, function (index, value) {
                            params = {
                                table: 'pedidos_itens',
                                columns: ['fk_id_pedido', 'fk_id_produto', 'valor_unitario', 'quantidade', 'valor_total'],
                                values: [
                                    idPedido,
                                    value.fk_id_produto,
                                    app.formatPrice(value.valor_unitario, 1),
                                    value.quantidade,
                                    app.formatPrice(value.valor_total, 1)
                                ]
                            };
                            app.saveRegister(params);
                        });
                        app.showMensagem('Registro salvo com sucesso.');
                        pedidos.rezeteFormularioPedido();
                    });
                }, app.transactionError);
            }

        });

        return false;
    },
    editarFormularioPedido: function () {
        $this = this;
        pedidos.populateSelectClientes(function () {
            app.findRegister('pedidos', $($this).attr('data-id'), function (result) {
                $('#modelPedidos_formulario input[name="id"]').val(result.id);
                $('#modelPedidos_formulario input[name="data_pedido"]').val(result.data_pedido);
                $('#modelPedidos_formulario select[name="cliente"]').val(result.fk_id_cliente);
                $('#modelPedidos_formulario input[name="valor_total"]').val(app.formatPrice(result.valor_total, 2));
            });
            sql = 'SELECT pi.*, p.produto FROM pedidos_itens AS pi INNER JOIN produtos AS p ON p.id = pi.fk_id_produto WHERE fk_id_pedido = ' + $($this).attr('data-id') + ' ORDER BY pi.id ASC';
            app.fetchRegisters(sql, function (resultArray) {
                pedidos.pedidoItens = [];
                for (i = 0; i < resultArray.length; i++) {
                    pedidos.pedidoItens[i] = {
                        fk_id_produto: resultArray[i].fk_id_produto,
                        produto: resultArray[i].produto,
                        quantidade: resultArray[i].quantidade,
                        valor_unitario: app.formatPrice(resultArray[i].valor_unitario, 2),
                        valor_total: app.formatPrice(resultArray[i].valor_total, 2)
                    };

                }
                pedidos.loadListPedidoItens();
            });
        });
    },
    carregarListaRegistros: function (callback) {
        if (pedidos.modeloAppend == '') {
            pedidos.modeloAppend = $("#listviewPedidos").html();
        }
        sql = "SELECT p.*, c.id AS idCliente, c.nome FROM pedidos AS p INNER JOIN clientes AS c ON p.fk_id_cliente = c.id ORDER BY p.id DESC";
        app.fetchRegisters(sql, function (resultArray) {
            $('#listviewPedidos').empty();
            if (resultArray.length) {
                var dividerData;
                $.each(resultArray, function (index, val) {
                    if(dividerData != val.data_pedido) {
                        dividerData = val.data_pedido;
                        $('#listviewPedidos').append('<li class="divider">'+app.formatDate('DD/MM/AAAA - {DIAEXTENSO}', val.data_pedido)+'</li>');
                    }
                    conteudoAppend = pedidos.modeloAppend.replace('{CLIENTE}', val.nome);
                    conteudoAppend = conteudoAppend.replace('{SITUACAO}', val.entregue == '0' ? 'Pendente' : 'Entregue');
                    conteudoAppend = conteudoAppend.replace('{EXECUTAR_ESTOQUE}', val.entregue == '0' ? 'Efetivar entrega' : 'Extornar entrega');
                    conteudoAppend = conteudoAppend.replace(/{ID-REGISTRO}/g, val.id);
                    conteudoAppend = conteudoAppend.replace(/{FK-ID-CLIENTE}/g, val.idCliente);
                    $('#listviewPedidos').append(conteudoAppend);
                });

                $('.dropdown').off('click');
                $('.dropdown').on('click', app.dropdownToggle);

                $('.btn_editar_pedidos').off('click');
                $('.btn_editar_pedidos').on('click', pedidos.editarFormularioPedido);

                $('.btn_executarEstoque').off('click');
                $('.btn_executarEstoque').on('click', pedidos.executarEstoque);



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
    executarEstoque: function () {
        app.findRegister('pedidos', $(this).attr('data-id'), function (resultPedido) {
            app.fetchRegisters({table: 'pedidos_itens', where: 'fk_id_pedido = ' + resultPedido.id}, function (resultItens) {
                $.each(resultItens, function (index, value) {
                    db.transaction(function (tx) {
                        if (resultPedido.entregue == '0') {
                            entregue = '1';
                            msg = 'Entrega efetivada com sucesso.';
                            tx.executeSql('UPDATE produtos SET estoque = estoque - ' + parseInt(value.quantidade) + ' WHERE id = ' + value.fk_id_produto, []);
                        } else {
                            entregue = '0';
                            msg = 'Entrega extornada com sucesso';
                            tx.executeSql('UPDATE produtos SET estoque = estoque + ' + parseInt(value.quantidade) + ' WHERE id = ' + value.fk_id_produto, []);
                        }
                    }, app.transactionError);
                });
                entregue = resultPedido.entregue == '0' ? '1' : '0';
                params = {
                    table: 'pedidos',
                    columns: ['id', 'entregue'],
                    values: [
                        resultPedido.id,
                        entregue
                    ]
                };
                app.saveRegister(params, function () {
                    app.showMensagem('Lançamento executado com sucesso.');
                    pedidos.carregarListaRegistros();
                });
            });
        });
        return false;
    },
    actionOpenWindow_formularioPedido: function () {
        $('#modelPedidos_formulario input[name="data_pedido"]').val(app.formatDate('AAAA-MM-DD'));
        pedidos.populateSelectClientes();
        pedidos.loadListPedidoItens();
    },
    populateSelectClientes: function (callback) {
        app.fetchRegisters({table: 'clientes', order: 'nome ASC'}, function (resultArray) {
            $('#modelPedidos_formulario select option[value!=""]').detach();
            $.each(resultArray, function (index, val) {
                $("#modelPedidos_formulario select[name='cliente']").append('<option value="' + val.id + '">' + val.nome + '</option>');
            });
            if (typeof callback == 'function') {
                callback();
            }
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
        valor_total = 0.00;
        if (pedidos.pedidoItens.length != 0) {

            $.each(pedidos.pedidoItens, function (index, value) {
                conteudoAppend = pedidos.modeloItensPedido.replace('{PRODUTO}', value.produto);
                conteudoAppend = conteudoAppend.replace('{QUANTIDADE}', value.quantidade);
                conteudoAppend = conteudoAppend.replace('{VALOR_UNITARIO}', value.valor_unitario);
                conteudoAppend = conteudoAppend.replace('{VALOR_TOTAL}', value.valor_total);
                conteudoAppend = conteudoAppend.replace(/{indexArray}/g, index);
                $('#listviewItensDoPedido').append(conteudoAppend);
                valor_total = parseFloat(valor_total) + parseFloat(app.formatPrice(value.valor_total, 1));
            });

            $('.dropdown').off('click');
            $('.dropdown').on('click', app.dropdownToggle);

            $('.btn_deletar_itemDoPedido').off('click');
            $('.btn_deletar_itemDoPedido').on('click', pedidos.removerItemPedido);

        } else {
            $('#listviewItensDoPedido').append('<li>Nenhum item adicionado no momento.</li>');
        }

        $('#modelPedidos_formulario input[name="valor_total"]').val(app.formatPrice(valor_total, 2));
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