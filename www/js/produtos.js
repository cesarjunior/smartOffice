var produtos = {
    table: 'produtos',
    primaryKey: 'id',
    returnRegisters: [],
    init: function () {
        app.getRegisters(produtos, {order: 'produto ASC'}, function (resultArray) {
            produtos.loadRegister(resultArray);
        });

        $('#btn_salvar_pageFormProdutos').on('tap', function () {
            params = {
                columns: [
                    'produto',
                    'valor_venda',
                    'estoque',
                    'observacao',
                    'id'
                ],
                values: [
                    $('#formulario_pageFormProdutos input[name="produto"]').val(),
                    $('#formulario_pageFormProdutos input[name="valor_venda"]').val(),
                    parseInt($('#formulario_pageFormProdutos input[name="estoque"]').val()),
                    $('#formulario_pageFormProdutos textarea[name="observacao"]').val(),
                    $('#formulario_pageFormProdutos input[name="id"]').val()
                ]

            };
            app.saveRegister(produtos, params, function () {
                app.getRegisters(produtos, {order: 'produto ASC'}, function (resultArray) {
                    produtos.loadRegister(resultArray);
                });
            });
            produtos.rezetePageFormProdutos();
        });

        $('#btn_cancelar_pageFormProdutos').on('tap', function () {
            produtos.rezetePageFormProdutos();
        });
    },
    loadRegister: function (resultArray, callback) {
        $('#listviewProdutos').empty();
        if (resultArray.length) {
            $.each(resultArray, function (index, val) {
                $('#listviewProdutos').append('<li><a href="#page_formProdutos" class="editarProduto" id="' + val.id + '" indexArray="' + index + '"><h2>' + val.produto + '</h2><p>Estoque: ' + val.estoque + '</p></a><a href="delete" id="' + val.id + '" indexArray="' + index + '">Delete</a></li>');
            });
            $("#listviewProdutos").listview('refresh');
            $('#listviewProdutos li .editarProduto').on('tap', function () {
                indexArray = parseInt($(this).attr('indexArray'));
                parameters = resultArray[indexArray];
                $('#formulario_pageFormProdutos input[name="id"]').val(parameters.id);
                $('#formulario_pageFormProdutos input[name="produto"]').val(parameters.produto);
                $('#formulario_pageFormProdutos input[name="valor_venda"]').val(parameters.valor_venda);
                $('#formulario_pageFormProdutos input[name="estoque"]').val(parameters.estoque);
                $('#formulario_pageFormProdutos textarea[name="observacao"]').val(parameters.observacao);
            });

            $('#listviewProdutos li a[href="delete"]').on('tap', function () {
                if (confirm('Deseja realmente excluir este item ?')) {
                    app.deleteRegister(produtos, $(this).attr('id'), function () {
                        app.getRegisters(produtos, {order: 'produto ASC'}, function (resultArray) {
                            produtos.loadRegister(resultArray);
                        });
                    });
                }
                return false;
            });
        } else {
            $('#listviewProdutos').append('<li>Nenhum registro localizado no momento.</li>');
        }
        if (typeof callback == 'function') {
            callback();
        }
    },
    rezetePageFormProdutos: function () {
        $('#formulario_pageFormProdutos input[name="id"]').val('');
        $('#formulario_pageFormProdutos input[name="produto"]').val('');
        $('#formulario_pageFormProdutos input[name="valor_venda"]').val('');
        $('#formulario_pageFormProdutos input[name="estoque"]').val('');
        $('#formulario_pageFormProdutos textarea[name="observacao"]').val('');
    }
}