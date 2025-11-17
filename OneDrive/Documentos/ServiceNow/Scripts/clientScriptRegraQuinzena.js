function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading || newValue == '') {
      return;
   }

	var dataInicioStr =  g_form.getValue('data_de_inicio');
	var dataHoje = new Date();
	var diaHoje = dataHoje.getDate(); 

	var dataInicioNum = getDateFromFormat(dataInicioStr, g_user_date_format);
	var dataInicio = new Date(dataInicioNum);

	var mesHoje = dataHoje.getMonth();
	var mesInicio = dataInicio.getMonth()

	if(diaHoje > 15 && mesInicio == mesHoje + 1  ){
		g_form.addErrorMessage('O prazo limite para solicitação de férias no mês subsequente é até o dia 15 de cada mês!')
		g_form.setValue('data_de_inicio', '');
	}
   
}