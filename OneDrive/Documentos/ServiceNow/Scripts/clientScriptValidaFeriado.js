function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue == '') {
        return;
    }

    try {

        function normalizeToISO(dateStr) {
            if (!dateStr) return '';
            // Se já for ISO yyyy-mm-dd
            if (dateStr.indexOf('-') > -1) {
                var p = dateStr.split('-');
                if (p[0].length === 4) return dateStr; // já yyyy-mm-dd
                // possivelmente dd-mm-yyyy -> converter
                return p[2] + '-' + p[1] + '-' + p[0];
            }
            // Se for dd/mm/yyyy
            if (dateStr.indexOf('/') > -1) {
                var p = dateStr.split('/');
                if (p[2].length === 4) return p[2] + '-' + p[1] + '-' + p[0];
            }
            return dateStr; // fallback
        }


        var dataInicioStr = g_form.getValue('data_de_inicio');
        var iso = normalizeToISO(dataInicioStr); // garante yyyy-mm-dd
        console.log('Enviando ISO para servidor:', iso);
        if (!dataInicioStr) return;


        var ga = new GlideAjax('AAImpFeriados');
        ga.addParam('sysparm_name', 'checkFeriadoProximo');
        ga.addParam('sysparm_data', iso);
        ga.getXML(callBackFunction);

        function callBackFunction(response) {
            var answer = response.responseXML.documentElement.getAttribute("answer");

            console.log('Resposta do checkFeriadoProximo: ' + answer);
            if (answer == 'true') {
                g_form.addErrorMessage('Não é possível solicitar férias para esta data. Existe um feriado nos próximos 2 dias.');
                g_form.setValue('data_de_inicio', "");
            } else if (answer == 'error') {
                g_form.addErrorMessage('Erro ao validar a data. Tente novamente.');
            }
        }

        return true;
    } catch (ex) {
        g_form.addErrorMessage('Erro no onChange de data_de_inicio: ' + ex.message);
        g_form.addErrorMessage('Erro ao processar a data de início. Tente novamente.');
        return false;
    }

}