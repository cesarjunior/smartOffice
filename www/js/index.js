var db;
var app = {
    init: function () {
        clientes.init();
        //produtos.init();
        //pedidos.init();
        app.openDatabase();
        db.transaction(function (tx) {
            //CREATE TABLE IF NOT EXISTS clientes (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome VARCHAR(100) NOT NULL, documento VARCHAR(20), telefone VARCHAR(15), endereco VARCHAR(50), bairro VARCHAR(50), cidade VARCHAR(50), estado VARCHAR(50), cep VARCHAR(10), observacao TEXT)
            //CREATE TABLE IF NOT EXISTS produtos (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, produto TEXT NOT NULL, valor_venda REAL NOT NULL, estoque INTEGER, observacao TEXT)
            //CREATE TABLE IF NOT EXISTS pedidos (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, fk_id_cliente INTEGER NOT NULL, desconto REAL, valor_total REAL, entregue INTEGER, observacao TEXT)
            //CREATE TABLE IF NOT EXISTS pedidos_itens (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, fk_id_pedido INTEGER NOT NULL, fk_id_produto INTEGER NOT NULL, valor_unitario REAL, qnt INTEGER, valor_total REAL)
            tx.executeSql("CREATE TABLE IF NOT EXISTS clientes (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, documento TEXT, telefone TEXT, endereco TEXT, bairro TEXT, cidade TEXT, estado TEXT, cep TEXT, observacao TEXT)", []);
            tx.executeSql("CREATE TABLE IF NOT EXISTS produtos (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, produto TEXT NOT NULL, valor_venda REAL NOT NULL, estoque INTEGER, observacao TEXT)", []);
            tx.executeSql("CREATE TABLE IF NOT EXISTS pedidos (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, fk_id_cliente INTEGER NOT NULL, desconto REAL, valor_total REAL, entregue INTEGER, observacao TEXT)", []);
            tx.executeSql("CREATE TABLE IF NOT EXISTS pedidos_itens (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, fk_id_pedido INTEGER NOT NULL, fk_id_produto INTEGER NOT NULL, valor_unitario REAL, quantidade INTEGER, valor_total REAL)", []);
            //tx.executeSql("DROP TABLE clientes");
            //tx.executeSql("DROP TABLE produtos");
            //tx.executeSql("DROP TABLE pedidos");
            //tx.executeSql("DROP TABLE pedidos_itens");
        }, app.transactionError);
    },
    openLoader: function () {
        options = {
            text: "Carregando",
            textVisible: true,
            theme: "z",
            html: ""
        }

        $.mobile.loading("show", options);
        return this;
    },
    closeLoader: function () {
        $.mobile.loading("hide");
        return this;
    },
    closeSlider: function () {
        $('#panel_slider').panel('close');
        return this;
    },
    openDatabase: function () {
        db = window.openDatabase("dbApp", "1.0", "Teste de dataBase", 200000);
    },
    transactionError: function (error) {
        console.log('Aqui msm');
        alert('Msg de erro: ' + error.message + ', C�digo: ' + error.code);
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
                    sql = sql + ' WHERE ' + params.where;
                } else if (typeof params.where == 'array') {
                    sql = sql + ' WHERE ' + params.where.toString();
                }
                if (typeof params.order == 'string') {
                    sql = sql + ' ORDER BY ' + params.order;
                }
            }

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
            db.transaction(function (tx) {
                positionID = params.values.length;
                positionID = positionID - 1;
                id = params.values[positionID];
                params.values.splice(positionID);
                params.columns.splice(positionID);
                if (id == '') {
                    value = [];
                    for (var i = 0; i < params.columns.length; i++) {
                        value[i] = '?';
                    }
                    sql = "INSERT INTO " + method.table + " (" + params.columns.toString() + ") VALUES (" + value.toString() + ")";
                } else {
                    set = [];
                    for (var i = 0; i < params.columns.length; i++) {
                        set[i] = params.columns[i] + ' = ?';
                    }
                    sql = "UPDATE " + method.table + " SET " + set.toString() + " WHERE id = " + id;
                }
                //alert(sql);
                tx.executeSql(sql, params.values, function (text, result) {
                    if (typeof callback == 'function') {
                        if (id == '') {
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