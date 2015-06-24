var clientes = {
    modeloAppend: '',
    init: function () {
        $('#btn_iniciarModulo_clientes').on('click', this.carregarListaRegistros);
        $('#btn_salvar_formularioClientes').on('click', this.salvarFormularioClientes);
        $('#btn_cancelar_formularioClientes').on('click', this.rezeteFormularioClientes);
        $('#btn_voltar_formularioClientes').on('click', this.rezeteFormularioClientes);
    },
    salvarFormularioClientes: function () {
        validate = true;
        $('#modelClientes_formulario .required').each(function () {
            if ($(this).val() == '' || $(this).val().length < 3) {
                $(this).addClass('error');
                validate = false;
            } else {
                $(this).removeClass('error');
            }
        });

        if (validate) {
            params = {
                table: 'clientes',
                columns: [],
                values: []
            };

            $('#modelClientes_formulario input').each(function () {
                if ($(this).val() != '') {
                    params.columns.push($(this).attr('name'));
                    params.values.push($(this).val());
                }
            });

            app.saveRegister(params, function () {
                app.showMensagem('Registro salvo com sucesso.');
                clientes.carregarListaRegistros();
                clientes.rezeteFormularioClientes();
            });
        }

        return false;
    },
    carregarListaRegistros: function (callback) {
        //app.openLoader();
        if (clientes.modeloAppend == '') {
            clientes.modeloAppend = $("#listviewClientes").html();
        }


        app.fetchRegisters({table: 'clientes', order: 'nome ASC'}, function (resultArray) {
            $('#listviewClientes').empty();
            if (resultArray.length) {
                $.each(resultArray, function (index, val) {
                    conteudoAppend = clientes.modeloAppend.replace('{NOME}', val.nome);
                    conteudoAppend = conteudoAppend.replace('{DOCUMENTO}', val.documento ? val.documento : '');
                    conteudoAppend = conteudoAppend.replace('{TELEFONE}', val.telefone ? val.telefone : '');
                    conteudoAppend = conteudoAppend.replace(/{ID-REGISTRO}/g, val.id);
                    $('#listviewClientes').append(conteudoAppend);
                });

                $('.dropdown').off('click');
                $('.dropdown').on('click', app.dropdownToggle);

                $('.btn_editar_clientes').off('click');
                $('.btn_editar_clientes').on('click', clientes.populateFormularioCliente);


                $('.btn_deletar_cliente').off('click');
                $('.btn_deletar_cliente').on('click', clientes.deleteCliente);

            } else {
                $('#listviewClientes').append('<li>Nenhum registro localizado no momento.</li>');
            }
            //app.closeLoader();
            if (typeof callback == 'function') {
                callback();
            }
        });
    },
    populateFormularioCliente: function () {
        app.findRegister('clientes', $(this).attr('data-id'), function (result) {
            $.each(result, function (index, val) {
                if (val != '') {
                    $('#modelClientes_formulario input[name="' + index + '"]').val(val);
                }
            });
        });
    },
    deleteCliente: function () {
        if (confirm('Deseja realmente excluir este item ?')) {
            app.deleteRegister('clientes', $(this).attr('data-id'), function () {
                app.showMensagem('Registro removido com sucesso.');
                clientes.carregarListaRegistros();
            });
        }
        return false;
    },
    rezeteFormularioClientes: function () {
        $('#modelClientes_formulario input').each(function () {
            $(this).val('');
        });
        window.history.back();
        return false;
    }
}