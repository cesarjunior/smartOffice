var pedidos = {
    table: 'pedidos',
    primaryKey: 'id',
    pedidoItens: [],
    init: function () {
        pedidos.loadRegister();

        //$.mobile.navigate( "#page_formPedidos" );

        $('#btn_novo_pagePedidos').on('tap', function () {
            pedidos.populateRegisterClientes();
            pedidos.pedidoItens = [];
            pedidos.loadItensPedido();
        });

        $('#btn_cancelar_pageFormPedidos').on('tap', function () {
            pedidos.rezetaPagePedido();
        });

        $('#btn_salvar_pageFormPedidos').on('tap', function () {
            params = {
                columns: [
                    'fk_id_cliente',
                    'valor_total',
                    'entregue',
                    'observacao',
                    'id'
                ],
                values: [
                    $('#formulario_pageFormPedidos select[name="clientes"]').val(),
                    $('#formulario_pageFormPedidos input[name="valor_total"]').val(),
                    0,
                    $('#formulario_pageFormPedidos textarea[name="observacao"]').val(),
                    $('#formulario_pageFormPedidos input[name="id"]').val()
                ]
            }

            app.saveRegister(pedidos, params, function (id) {
                db.transaction(function (tx) {
                    var sql = "DELETE FROM pedidos_itens WHERE fk_id_pedido = " + id;
                    tx.executeSql(sql, [], function () {
                        $.each(pedidos.pedidoItens, function (index, val) {
                            db.transaction(function (tx) {
                                valor_total = val.quantidade * val.valor_unitario;
                                tx.executeSql("INSERT INTO pedidos_itens (fk_id_pedido, fk_id_produto, valor_unitario, quantidade, valor_total) VALUES (" + id + ", " + val.id + ", " + val.valor_unitario + ", " + val.quantidade + ", " + valor_total + ")", [], function () {
                                    $('#listviewPedidos li .editarPedido').off('tap');
                                    $('#listviewPedidos .listaAcao').off('tap');
                                    $('#popupAcoesPedidos .acaoEstoque').off('tap');
                                    pedidos.loadRegister();
                                });
                            }, app.transactionError);
                        });
                    });
                }, app.transactionError);
            });
        });

        $('#page_localizaProdutoPedido').on('pageshow', function () {
            app.getRegisters(produtos, {order: 'produto ASC'}, function (resultArray) {
                $('#listviewLocalizarProdutos').empty();
                if (resultArray.length) {
                    $.each(resultArray, function (index, val) {
                        $('#listviewLocalizarProdutos').append('<li><a href="#page_adicionaItemPedido" class="adicionarProduto" id="' + val.id + '" indexArray="' + index + '"><h2>' + val.produto + '</h2><p>Estoque: ' + val.estoque + '</p></a></li>');
                    });
                    $("#listviewLocalizarProdutos").listview('refresh');
                    $('#listviewLocalizarProdutos .adicionarProduto').on('tap', function () {
                        indexArray = $(this).attr('indexArray');
                        $('#formulario_pageAdicionaItemPedido input[name="id"]').val(resultArray[indexArray].id);
                        $('#formulario_pageAdicionaItemPedido input[name="produto"]').val(resultArray[indexArray].produto);
                        $('#div_nomeProdutoPageAdicionaItemPedido').html('<strong>' + resultArray[indexArray].produto + '</strong>');
                        $('#formulario_pageAdicionaItemPedido input[name="valor_unitario"]').val(resultArray[indexArray].valor_venda);
                    });
                }
            });
        });

        $('#btn_voltar_pageAdicionaItemPedido').on('tap', function () {
            pedidos.rezetaPageAdicionaItem();
        });

        $('#btn_concluir_pageAdicionaItemPedido').on('tap', function () {
            if ($('#formulario_pageAdicionaItemPedido input[name="indexArray"]').val() != '') {
                indexArray = $('#formulario_pageAdicionaItemPedido input[name="indexArray"]').val();
            } else {
                indexArray = pedidos.pedidoItens.length;
            }

            pedidos.pedidoItens[indexArray] = {
                id: $('#formulario_pageAdicionaItemPedido input[name="id"]').val(),
                produto: $('#formulario_pageAdicionaItemPedido input[name="produto"]').val(),
                valor_unitario: $('#formulario_pageAdicionaItemPedido input[name="valor_unitario"]').val(),
                quantidade: $('#formulario_pageAdicionaItemPedido input[name="quantidade"]').val()
            }
            pedidos.loadItensPedido();
            pedidos.rezetaPageAdicionaItem();
        });
    },
    populateRegisterClientes: function (itemSelected) {
        app.getRegisters(clientes, {order: 'nome ASC'}, function (resultArray) {
            $('#formulario_pageFormPedidos select option[value!=""]').detach();
            $.each(resultArray, function (index, val) {
                if (itemSelected == val.id) {
                    selected = 'selected="selected"';
                } else {
                    selected = '';
                }
                $("#formulario_pageFormPedidos select[name='clientes']").append('<option value="' + val.id + '" ' + selected + '>' + val.nome + '</option>');
            });
            if (typeof itemSelected != 'undefined') {
                $("#formulario_pageFormPedidos select[name='clientes']").selectmenu("refresh");
            }
        });
    },
    loadRegister: function (callback) {
        db.transaction(function (tx) {
            sql = "SELECT p.*, c.nome FROM pedidos AS p INNER JOIN clientes AS c ON p.fk_id_cliente = c.id ORDER BY p.id DESC";
            tx.executeSql(sql, [], function (text, result) {
                $('#listviewPedidos').empty();
                if (result.rows.length) {

                    for (var i = 0; i < result.rows.length; i++) {
                        $('#listviewPedidos').append('<li><a href="#page_formPedidos" class="editarPedido" id="' + result.rows.item(i).id + '" indexArray="' + i + '"><h2>' + result.rows.item(i).nome + '</h2><p>Situa\u00e7\u00e3o: <strong>' + pedidos.getSituacaoPedido(result.rows.item(i).entregue) + '</strong></p></a><a href="#" class="listaAcao" id="' + result.rows.item(i).id + '" indexArray="' + i + '">Delete</a></li>');
                    }

                    $("#listviewPedidos").listview('refresh');

                    var tapItem;
                    $('#listviewPedidos .editarPedido').on('tap', function (event) {
                        $this = this;
                        setTimeout(function () {
                            actionIndex = parseInt($($this).attr('indexArray'));
                            tapItem = result.rows.item(actionIndex);
                            pedidos.populateRegisterClientes(tapItem.fk_id_cliente);

                            $('#formulario_pageFormPedidos input[name="id"]').val(tapItem.id);
                            $('#formulario_pageFormPedidos input[name="valor_total"]').val(tapItem.valor_total);
                            $('#formulario_pageFormPedidos textarea[name="observacao"]').val(tapItem.observacao);

                            db.transaction(function (tx) {
                                var sql = "SELECT pi.*, p.produto FROM pedidos_itens AS pi INNER JOIN produtos AS p ON p.id = pi.fk_id_produto WHERE pi.fk_id_pedido = " + tapItem.id;
                                tx.executeSql(sql, [], function (text, result) {
                                    pedidos.pedidoItens = [];
                                    for (var i = 0; i < result.rows.length; i++) {
                                        pedidos.pedidoItens[i] = {
                                            id: result.rows.item(i).fk_id_produto,
                                            produto: result.rows.item(i).produto,
                                            valor_unitario: result.rows.item(i).valor_unitario,
                                            quantidade: result.rows.item(i).quantidade
                                        }
                                    }
                                    pedidos.loadItensPedido();
                                });
                            }, app.transactionError);
                        }, 500);
                    });

                    $('#listviewPedidos .listaAcao').on('tap', function (event) {
                        actionIndex = parseInt($(event.target).attr('indexArray'));
                        tapItem = result.rows.item(actionIndex);

                        if (tapItem.entregue == 0) {
                            $('#popupAcoesPedidos .acaoEstoque').html('Lan\u00e7ar Estoque');
                        } else {
                            $('#popupAcoesPedidos .acaoEstoque').html('Extornar Estoque');
                        }

                        $("#popupAcoesPedidos").popup("open", {x: event.pageX, y: event.pageY});
                        return false;
                    });

                    $('#popupAcoesPedidos .acaoEstoque').on('tap', function () {
                        $("#popupAcoesPedidos").popup("close");
                        app.openLoader();

                        db.transaction(function (tx) {
                            var sql = "SELECT * FROM pedidos_itens WHERE fk_id_pedido = " + tapItem.id;
                            tx.executeSql(sql, [], function (text, result) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    quantidade = result.rows.item(i).quantidade;
                                    sql = "SELECT * FROM produtos WHERE id = " + result.rows.item(i).fk_id_produto;
                                    tx.executeSql(sql, [], function (text, result) {
                                        estoqueAtual = result.rows.item(0).estoque;
                                        if (tapItem.entregue == 0) {
                                            // Caso a ação seja para executar entrega, então o estoque é retirado.
                                            novoEstoque = estoqueAtual - quantidade;
                                        } else {
                                            // Caso a ação seja para extorna a entrega, entao o estoque é acrescido.
                                            novoEstoque = estoqueAtual + quantidade;
                                        }
                                        sql = "UPDATE produtos SET estoque = " + novoEstoque + " WHERE id = " + result.rows.item(0).id;
                                        tx.executeSql(sql);
                                    });
                                }
                                if (tapItem.entregue == 0) {
                                    entregue = 1;

                                } else {
                                    entregue = 0;
                                }
                                sql = "UPDATE pedidos SET entregue = " + entregue + " WHERE id = " + tapItem.id;
                                tx.executeSql(sql, [], function (text, result) {
                                    $('#listviewPedidos li .editarPedido').off('tap');
                                    $('#listviewPedidos .listaAcao').off('tap');
                                    $('#popupAcoesPedidos .acaoEstoque').off('tap');
                                    pedidos.loadRegister(app.closeLoader());
                                });
                            });

                        });
                    });

                } else {
                    $('#listviewPedidos').append('<li>Nenhum registro localizado no momento.</li>');
                }
                if (typeof callback == 'function') {
                    callback();
                }
            });
        }, app.transactionError);

    },
    loadItensPedido: function () {
        $('#listview_itensPedido').empty();
        total_produtos = 0.00;
        if (pedidos.pedidoItens.length) {
            $.each(pedidos.pedidoItens, function (index, val) {
                valor_total = val.valor_unitario * val.quantidade;
                total_produtos = total_produtos + valor_total;
                $('#listview_itensPedido').append('<li><a href="#page_adicionaItemPedido" class="editarItemPedido" id="' + val.id + '" indexArray="' + index + '"><h2>' + val.produto + '</h2> <p>R$ ' + val.valor_unitario + ' X ' + val.quantidade + ' = R$ ' + valor_total + '</p></a><a href="#" class="ui-icon-delete deleteItemPedido" id="' + val.id + '" indexArray="' + index + '">Delete</a></li>');
            });
        } else {
            $('#listview_itensPedido').append('<li>Nenhum Item</li>');
        }
        $("#listview_itensPedido").listview('refresh');

        $('#formulario_pageFormPedidos input[name="valor_total"]').val(total_produtos);

        $('#listview_itensPedido .editarItemPedido').on('tap', function () {
            indexArray = $(this).attr('indexArray');
            $('#formulario_pageAdicionaItemPedido input[name="indexArray"]').val(indexArray);
            $('#formulario_pageAdicionaItemPedido input[name="id"]').val(pedidos.pedidoItens[indexArray].id);
            $('#formulario_pageAdicionaItemPedido input[name="produto"]').val(pedidos.pedidoItens[indexArray].produto);
            $('#div_nomeProdutoPageAdicionaItemPedido').html(pedidos.pedidoItens[indexArray].produto);
            $('#formulario_pageAdicionaItemPedido input[name="valor_unitario"]').val(pedidos.pedidoItens[indexArray].valor_unitario);
            $('#formulario_pageAdicionaItemPedido input[name="quantidade"]').val(pedidos.pedidoItens[indexArray].quantidade);
        });

        $('#listview_itensPedido .deleteItemPedido').on('tap', function () {
            indexArray = $(this).attr('indexArray');
            pedidos.pedidoItens.splice(indexArray, 1);
            pedidos.loadItensPedido();
            return false;
        });
    },
    getSituacaoPedido: function (situacao) {
        if (situacao == 0) {
            return 'Pendente';
        } else {
            return 'Entregue';
        }
    },
    rezetaPagePedido: function () {
        $('#formulario_pageFormPedidos input[name="valor_total"]').val('');
        $('#formulario_pageFormPedidos textarea[name="observacao"]').val('');
    },
    rezetaPageAdicionaItem: function () {
        $('#formulario_pageAdicionaItemPedido input[name="indexArray"]').val('');
        $('#formulario_pageAdicionaItemPedido input[name="id"]').val('');
        $('#formulario_pageAdicionaItemPedido input[name="produto"]').val('');
        $('#div_nomeProdutoPageAdicionaItemPedido').empty();
        $('#formulario_pageAdicionaItemPedido input[name="valor_unitario"]').val('');
        $('#formulario_pageAdicionaItemPedido input[name="quantidade"]').val('');
    }
}