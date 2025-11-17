var AAImpFeriados = Class.create();
AAImpFeriados.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    SCHEDULE_FERIADOS_NACIONAIS: 'a0c84c211b60f8103f3d87f1f54bcb59',

	getFeriados: function(mesAtual) {
    var query = "SELECT DISTINCT TOP 10 P3_DATA, P3_DESC FROM SP3000 s WHERE D_E_L_E_T_ = ''";
    query += " ORDER BY P3_DATA DESC";

    try {
        var r = new sn_ws.RESTMessageV2('Integration_ ERP_Protheus', 'POST_query');
        r.setRequestBody(JSON.stringify({
            query: query
        }));
        var response = r.execute();
        var responseBody = response.getBody();
        var httpStatus = response.getStatusCode();

        if (httpStatus == 201 || httpStatus == 200) {
            var resultado = JSON.parse(responseBody);
            
            if (resultado && resultado.data) {
                gs.info('Total de feriados recebidos do Protheus: ' + resultado.records);
                return resultado.data;  // <-- AQUI É A MUDANÇA!
            } else {
                gs.warn('Resposta sem dados');
                return null;
            }
        }
    } catch (ex) {
        gs.error('AAImpFeriados - Erro ao chamar o serviço Protheus: ' + ex.message);
    }

    return null;
},

    

    insertData: function(data) {
        var gr = new GlideRecord('cmn_schedule_span');


        var rawDate = data.P3_DATA;

        var formatted = rawDate.substring(0, 4) + '-' + rawDate.substring(4, 6) + '-' + rawDate.substring(6, 8);

        gr.addEncodedQuery(
            'schedule=' + this.SCHEDULE_FERIADOS_NACIONAIS +
            '^name=' + data.P3_DESC.trim() +
            '^start_date_timeLIKE' + formatted +
            '^end_date_timeLIKE' + formatted
        );
        gr.query();

        if (!gr.next()) {
            gr.initialize();
            gr.schedule = this.SCHEDULE_FERIADOS_NACIONAIS;
            gr.name = data.P3_DESC.trim();
            gr.start_date_time = formatted;
            gr.end_date_time = formatted;
            gr.type = 'exclude';
            gr.show_as = 'busy';
            gr.setValue('all_day', true);
            gr.setWorkflow(false);

            var sysId = gr.insert();
            if (sysId) {
                return sysId;
            } else {
                gs.warn('Insert falhou para ' + data.P3_DESC);
            }
        } else {
            gs.info('Já existe: ' + data.P3_DESC + ' (' + rawDate + ')');
        }

        return null;
    },

    checkFeriadoProximo: function(dateParam /* yyyy-mm-dd */ ) {
        
        try {
            var dateStr = dateParam || this.getParameter('sysparm_data');
            if (!dateStr) {
                return 'false';
            }
			 gs.info('=== checkFeriadoProximo ===');
        	 gs.info('Data recebida: ' + dateStr);
			
			var parts = dateStr.split('-');
            var dataInicioCompacta = parts[0] + parts[1] + parts[2] + 'T000000';

           
			var dt = new GlideDateTime();
            dt.setDisplayValue(dateStr + ' 00:00:00');
            dt.addDaysLocalTime(2);

		
			var dataFimDisplay = dt.getDisplayValue().split(' ')[0];
            var partsFim = dataFimDisplay.split('/');
            var dataFimCompacta = partsFim[2] + partsFim[1] + partsFim[0] + 'T235959';
			gs.info('Buscando entre: ' + dataInicioCompacta + ' e ' + dataFimCompacta);


            var gr = new GlideRecord('cmn_schedule_span');
            gr.addQuery('schedule', this.SCHEDULE_FERIADOS_NACIONAIS);
			gr.addQuery('sys_class_name','<>', 'Fiscal period');
            gr.addQuery('start_date_time', '>=', dataInicioCompacta);
            gr.addQuery('start_date_time', '<=', dataFimCompacta);
            gr.query();



            if (gr.hasNext()) {
            while (gr.next()) {
                gs.info('Feriado bloqueador: ' + gr.name + ' em ' + gr.start_date_time.getDisplayValue());
            }
            return 'true';
        }
			gs.info('AAImpFeriados: Passou por aqui, não tem feriado entre as datas.');
            return 'false';
			
        } catch (e) {
            gs.error('Erro em checkFeriadoProximo: ' + e.message);
            return 'error';
        }
    },

    type: 'AAImpFeriados'
});