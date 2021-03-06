var db;
var app = {
    init: function () {
        clientes.init();
        produtos.init();
        pedidos.init();
        app.openDatabase();
        app.displayContainer();
        $(window).on('popstate', this.displayContainer);
        $('.content-toggle').on('click', this.toggleContent);
        $('.dropdown').on('click', this.dropdownToggle);
        db.transaction(function (tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS clientes (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, documento TEXT, telefone TEXT, email TEXT, endereco TEXT, bairro TEXT, cidade TEXT, estado TEXT, cep TEXT, observacao TEXT, editado INTEGER, excluido INTEGER)", []);
            tx.executeSql("CREATE TABLE IF NOT EXISTS produtos (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, produto TEXT NOT NULL, codigo TEXT, valor_venda REAL NOT NULL, estoque INTEGER, observacao TEXT, editado INTEGER, excluido INTEGER)", []);
            tx.executeSql("CREATE TABLE IF NOT EXISTS pedidos (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, fk_id_cliente INTEGER NOT NULL, desconto REAL, valor_total REAL, entregue INTEGER, observacao TEXT, data_pedido TEXT, editado INTEGER, excluido INTEGER)", []);
            tx.executeSql("CREATE TABLE IF NOT EXISTS pedidos_itens (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, fk_id_pedido INTEGER NOT NULL, fk_id_produto INTEGER NOT NULL, valor_unitario REAL, quantidade INTEGER, valor_total REAL, editado INTEGER, excluido INTEGER)", []);
            //tx.executeSql("DROP TABLE clientes");
            //tx.executeSql("DROP TABLE produtos");
            //tx.executeSql("DROP TABLE pedidos");
            //tx.executeSql("DROP TABLE pedidos_itens");
        }, app.transactionError);
    },
    displayContainer: function () {
        var hashTag = (window.location.hash == '') ? '#dashboard' : window.location.hash;
        $('.pageContainer').hide();
        $(hashTag).fadeIn('slow');
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
        console.log(error.message);
        app.showMensagem('Msg de erro: ' + error.message + ', C�digo: ' + error.code)
    },
    fetchRegisters: function (params, callback) {
        // method Necess�rio ser Objeto referente aos dados que esta sendo trabalhado
        // params � esperado STRING para passar a SQL completa ou Objeto esperando table, columns, where e order como itens
        // item columns do params pode ser esperado string ou array assim como where e order � esperado apenas string

        returnArray = [];
        try {

            if (typeof params != 'string' && typeof params != 'object') {
                throw 'Parametro params dentro do getRegisters inesperado.';
            } else {
                if (typeof params == 'string' && params.length < 17) {
                    throw 'Parametro params contendo SQL inesperado.';
                } else if (typeof params == 'object') {
                    if (params.table == '') {
                        throw 'Parametro params.table inesperado dentro do fetchRegister';
                    }
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

                sql = sql + ' FROM ' + params.table;
                if (typeof params.where == 'string') {
                    sql = sql + ' WHERE ' + params.where + " AND excluido = 0";
                } else if (typeof params.where == 'array') {
                    sql = sql + ' WHERE ';
                    $.each(params.where, function (index, val) {
                        sql = sql + val + ' AND ';
                    });
                    sql = sql + 'excluido = 0';
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
    findRegister: function (table, id, callback) {
        try {
            sqlQuery = 'SELECT * FROM ' + table + ' WHERE id = ?';
            db.transaction(function (tx) {
                //console.log(sqlQuery);
                tx.executeSql(sqlQuery, [id], function (text, result) {
                    if (result.rows.length == 1) {
                        returnResult = result.rows.item(0);
                    } else {
                        throw 'Resultados inesperado para o metodo de consulta findRegister';
                    }
                    if (typeof callback == 'function') {
                        callback(returnResult);
                    }

                    return returnResult;
                });
            }, app.transactionError);
        } catch (error) {
            alert('Error: ' + error);
        }
    },
    saveRegister: function (params, callback) {
        try {
            if (typeof params != 'object') {
                throw 'Parametro params dentro do saveRegister inesperado';
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
                    sql = "INSERT INTO " + params.table + " (" + params.columns.toString() + ") VALUES (" + value.toString() + ")";
                } else {
                    id = params.values[positionID];
                    params.values.splice(positionID, 1);
                    params.columns.splice(positionID, 1);
                    set = [];
                    $.each(params.columns, function (index, value) {
                        set.push(value + ' = ?');
                    });
                    sql = "UPDATE " + params.table + " SET " + set.toString() + " WHERE id = " + id;
                }
                //console.log(sql);
                //console.log(params.values);
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
    deleteRegister: function (table, id, callback) {
        try {
            if (table == '') {
                throw 'Parametro table dentro do delete Register inválido.';
            }
            if (id == '') {
                throw 'Parametro id dentro do deleteRegister inválido.';
            }

            db.transaction(function (tx) {
                sql = "UPDATE " + table + " SET excluido = 1, editado = 1 WHERE id = ?";
                //console.log(id);
                tx.executeSql(sql, [id], function (text, result) {
                    if (typeof callback == 'function') {
                        callback();
                    }
                });
            }, app.transactionError);
            return;
        } catch (error) {
            alert('Error: ' + error);
        }
    },
    maskMoney: function () {
        valor = $(this).val();
        valor = valor.replace(/\D/g, '');
        if (valor.length == 0) {
            valor = '000';
        } else {
            if (valor.length < 3) {
                for (i = valor.length; i < 3; i++) {
                    valor = '0' + valor;
                }

            }
            if (valor.length > 3) {
                for (i = 1; i <= valor.length; i++) {
                    if (valor.length > 3) {
                        if (valor.slice(0, 1) == 0) {
                            valor = valor.slice(1);
                        } else {
                            break;
                        }
                    }
                }

            }
        }
        antiVirgula = valor.slice(0, valor.length - 2);
        posVirgula = valor.slice(-2);
        valor = antiVirgula + ',' + posVirgula;
        $(this).val(valor);
    },
    formatPrice: function (price, tipo) {
        if (tipo == 1) {
            price = price.toString().replace(',', '.');
        }

        if (tipo == 2) {
            if (price != '') {
                arrayPrice = price.toString().split('.');
                if (arrayPrice.length == 2) {
                    if (arrayPrice[1].length == 1) {
                        arrayPrice[1] = arrayPrice[1] + '0';
                    }
                    price = arrayPrice[0] + ',' + arrayPrice[1];
                } else {
                    price = price + ',00';
                }
            } else {
                price = '0,00';
            }
        }

        return price;
    },
    formatDate: function (format, entrada) {
        var arrayDia = new Array(7);
        arrayDia[0] = "Domingo";
        arrayDia[1] = "Segunda-Feira";
        arrayDia[2] = "Terça-Feira";
        arrayDia[3] = "Quarta-Feira";
        arrayDia[4] = "Quinta-Feira";
        arrayDia[5] = "Sexta-Feira";
        arrayDia[6] = "Sábado";

        var arrayMes = new Array(12);
        arrayMes[0] = "Janeiro";
        arrayMes[1] = "Fevereiro";
        arrayMes[2] = "Março";
        arrayMes[3] = "Abril";
        arrayMes[4] = "Maio";
        arrayMes[5] = "Junho";
        arrayMes[6] = "Julho";
        arrayMes[7] = "Agosto";
        arrayMes[8] = "Setembro";
        arrayMes[9] = "Outubro";
        arrayMes[10] = "Novembro";
        arrayMes[11] = "Dezembro";

        data = new Date();

        if (!entrada) {
            dia = data.getDate();
            mes = parseInt(data.getMonth()) + parseInt(1);
            ano = data.getFullYear();
            if (dia.toString().length == '1') {
                dia = '0' + dia;
            }
            if (mes.toString().length == '1') {
                mes = '0' + mes;
            }
        } else {
            if (entrada.indexOf('/') != '-1') {
                arrayData = entrada.split('/');
                dia = arrayData[0];
                mes = arrayData[1];
                ano = arrayData[2];
            } else if (entrada.indexOf('-') != '-1') {
                arrayData = entrada.split('-');
                dia = arrayData[2];
                mes = arrayData[1];
                ano = arrayData[0];
            } else {
                //Formato Inválido
            }

            data.setDate(dia);
            data.setMonth(parseInt(mes) - 1);
        }

        diaExtenso = arrayDia[data.getDay()];
        mesExtenso = arrayMes[data.getMonth()];

        retornaData = format.replace('DD', dia);
        retornaData = retornaData.replace('MM', mes);
        retornaData = retornaData.replace('AAAA', ano);
        retornaData = retornaData.replace('{DIAEXTENSO}', diaExtenso);
        retornaData = retornaData.replace('{MESEXTENSO}', mesExtenso);
        return retornaData;
    }
}