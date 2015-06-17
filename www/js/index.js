var db;
var app = {
    init: function () {
        clientes.init();
        //produtos.init();
        //pedidos.init();
        app.openDatabase();
        app.displayContainer();
        $(window).on('popstate', this.displayContainer);
        $('.content-toggle').on('click', this.toggleContent);
        $('.dropdown').on('click', this.dropdownToggle);

        db.transaction(function (tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS clientes (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, documento TEXT, telefone TEXT, email TEXT, endereco TEXT, bairro TEXT, cidade TEXT, estado TEXT, cep TEXT, observacao TEXT, editado INTEGER, excluido INTEGER)", []);
            //tx.executeSql("CREATE TABLE IF NOT EXISTS produtos (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, produto TEXT NOT NULL, valor_venda REAL NOT NULL, estoque INTEGER, observacao TEXT)", []);
            //tx.executeSql("CREATE TABLE IF NOT EXISTS pedidos (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, fk_id_cliente INTEGER NOT NULL, desconto REAL, valor_total REAL, entregue INTEGER, observacao TEXT)", []);
            //tx.executeSql("CREATE TABLE IF NOT EXISTS pedidos_itens (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, fk_id_pedido INTEGER NOT NULL, fk_id_produto INTEGER NOT NULL, valor_unitario REAL, quantidade INTEGER, valor_total REAL)", []);
            //tx.executeSql("DROP TABLE clientes");
            //tx.executeSql("DROP TABLE produtos");
            //tx.executeSql("DROP TABLE pedidos");
            //tx.executeSql("DROP TABLE pedidos_itens");
        }, app.transactionError);
    },
    displayContainer: function () {
        var hashTag = (window.location.hash == '') ? '#dashboard' : window.location.hash;

        $('.pageContainer').attr('style', 'display: none');
        $(hashTag).attr('style', 'display: block');
    },
    showMensagem: function (msg) {
        $('#contentAlert').show();
        $('#contentAlert .mensagemAlerta').html(msg);
        $('#contentAlert .mensagemAlerta').animate({
            height: '50px'
        }, 'slow', function () {
            setTimeout(function () {
                $('#contentAlert .mensagemAlerta').animate({
                    height: '0px'
                }, 'slow', function () {
                    $('#contentAlert').hide();
                });
            }, 2000);
        });

        return this;
    },
    toggleSlider: function (action) {
        // create menu variables
        var slideMenu = $('#menuSlider');
        var positionLeft = "-325px";

        if (typeof action != 'string') {
            if (slideMenu.css('left') == positionLeft) {
                action = 'open';
            } else {
                action = 'close';
            }
        }

        if (action == 'open') {
            // Abre o Menu
            slideMenu.animate({
                left: "0px"
            });
            $('.openMenuSlider').children('i').animate({
                left: -9
            });
        } else if (action == 'close') {
            //Fecha o Menu
            $('.openMenuSlider').children('i').animate({
                left: 0
            });
            slideMenu.animate({
                left: positionLeft
            }, 250);
        }

        return this;
    },
    toggleContent: function () {
        var $thisClick = this;
        var idContent = "#" + $($thisClick).attr('content-toggle');
        $(idContent).toggle('slow', function () {
            if ($(this).css('display') == 'block') {
                $($thisClick).removeClass("icon-chevron-down").addClass("icon-chevron-up");
            } else {
                $($thisClick).removeClass("icon-chevron-up").addClass("icon-chevron-down");
            }
        });
        return false;
    },
    dropdownToggle: function () {
        app.toggleSlider('close');
        $('.dropdown-menu').hide();
        $(this).parent().children('.dropdown-menu').toggle();
        return false;
    },
    openDatabase: function () {
        db = window.openDatabase("smartDB", "1.0", "Banco de Dados do smartOffice.", 200000);
    },
    transactionError: function (error) {
        app.showMensagem('Msg de erro: ' + error.message + ', C�digo: ' + error.code)
    },
    getRegisters: function (method, params, callback) {
        // method Necess�rio ser Objeto referente aos dados que esta sendo trabalhado
        // params � esperado STRING para passar a SQL completa ou Objeto esperando columns, where e order como itens
        // item columns do params pode ser esperado string ou array assim como where e order � esperado apenas string

        returnArray = [];
        try {
            if (typeof method != 'object') {
                throw 'Parametro method dentro do getRegister n�o � Objeto.';
            }
            if (typeof params != 'string' && typeof params != 'object') {
                throw 'Parametro params dentro do getRegisters inesperado.';
            } else {
                if (typeof params == 'string' && params.length < 17) {
                    throw 'Parametro params contendo SQL inesperado.';
                }
            }
            //
            // Inicio da Rotina para montagem da SQL
            //
            sql = '';
            if (typeof params == 'string') {
                sql = params;
            } else {
                sql = 'SELECT ';
                if (typeof params.columns == 'string') {
                    sql = sql + params.cloumns;
                } else if (typeof params.columns == 'array') {
                    sql = sql + params.columns.toString();
                } else {
                    sql = sql + '*';
                }

                if (sql.length == 0) {
                    throw 'SQL montada de forma errada dendo do getRegisters';
                }
                sql = sql + ' FROM ' + method.table;

                if (typeof params.where == 'string') {
                    sql = sql + ' WHERE ' + params.where + "AND excluido = '0'";
                } else {
                    sql = sql + ' WHERE excluido = 0';
                }

                if (typeof params.order == 'string') {
                    sql = sql + ' ORDER BY ' + params.order;
                }
            }
            //console.log(sql);

            //
            // FIM da rotina de montagem da SQL
            //
            db.transaction(function (tx) {
                tx.executeSql(sql, [], function (text, result) {
                    for (var i = 0; i < result.rows.length; i++) {
                        returnArray[i] = result.rows.item(i);
                    }

                    if (typeof callback == 'function') {
                        callback(returnArray);
                    }
                    return returnArray;
                });
            }, app.transactionError);
        } catch (error) {
            alert('Error: ' + error);
        }
    },
    saveRegister: function (method, params, callback) {
        try {
            if (typeof params != 'object') {
                throw 'Parametro params dentro do saveRegister inesperado';
            }
            if (typeof method != 'object') {
                throw 'Parametro method dentro do saveRegister inesperado';
            }

            params.columns.push('editado');
            params.values.push('1');

            params.columns.push('excluido');
            params.values.push('0');

            db.transaction(function (tx) {
                positionID = params.columns.indexOf('id');
                if (positionID == '-1') {
                    value = [];
                    $.each(params.columns, function () {
                        value.push('?');
                    });
                    sql = "INSERT INTO " + method.table + " (" + params.columns.toString() + ") VALUES (" + value.toString() + ")";
                } else {
                    id = params.values[positionID];
                    params.values.splice(positionID);
                    params.columns.splice(positionID);
                    set = [];
                    $.each(params.columns, function (index, value) {
                        set.push(value + ' = ?');
                    });
                    sql = "UPDATE " + method.table + " SET " + set.toString() + " WHERE id = " + id;
                }

                tx.executeSql(sql, params.values, function (text, result) {
                    if (typeof callback == 'function') {
                        if (positionID == '-1') {
                            callback(result.insertId);
                        } else {
                            callback(id);
                        }
                    }
                });
            }, app.transactionError);
        } catch (error) {
            alert('Error: ' + error);
        }
        return;
    },
    deleteRegister: function (method, id, callback) {
        try {
            if (typeof method != 'object') {
                throw 'Parametro method dentro do deleteRegister inesperado';
            }
            if (id == '') {
                throw 'Parametro id dentro do deleteRegister vazio.';
            }
            db.transaction(function (tx) {
                var sql = "DELETE FROM " + method.table + " WHERE id = ?";
                tx.executeSql(sql, [id], function (text, result) {
                    if (typeof callback == 'function') {
                        callback();
                        alert('Item removido com sucesso.');
                    }
                });
            }, app.transactionError);
            return;
        } catch (error) {
            alert('Error: ' + error);
        }
    }
}