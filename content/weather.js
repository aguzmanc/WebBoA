// ---------------------= =---------------------
var nacional_loaded = false;
var internacional_loaded = false;

var weather_table = {
	cbba:{
		div_id:"cont_5a89265739bb1ccf8dbf7e2d9cdb1c9a",
		span_id:"h_5a89265739bb1ccf8dbf7e2d9cdb1c9a",
		href:"colcapirhua.htm",
		script_widget:"5a89265739bb1ccf8dbf7e2d9cdb1c9a"
	},
	scz:{
		div_id:"cont_4c009c4410530037e3de5bd9b93dac3a",
		span_id:"h_4c009c4410530037e3de5bd9b93dac3a",
		href:"samaipata.htm",
		script_widget:"4c009c4410530037e3de5bd9b93dac3a"
	},
	lpz:{
		div_id:"cont_4b4f6022e7fa06ded38f6eb6d71fa587",
		span_id:"h_4b4f6022e7fa06ded38f6eb6d71fa587",
		href:"la-paz-in-bolivia-c17637.htm",
		script_widget:"4b4f6022e7fa06ded38f6eb6d71fa587"
	},
	sucre:{
		div_id:"cont_71f766d247737797856e25ad3dd3fa7c",
		span_id:"h_71f766d247737797856e25ad3dd3fa7c",
		href:"sucre-in-bolivia-c17635.htm",
		script_widget:"71f766d247737797856e25ad3dd3fa7c"
	},
	tja:{
		div_id:"cont_2244e126e4cd0b63c16da1a541ec4b1d",
		span_id:"h_2244e126e4cd0b63c16da1a541ec4b1d",
		href:"tomatas.htm",
		script_widget:"2244e126e4cd0b63c16da1a541ec4b1d"
	},
	tri:{
		div_id:"cont_1f51e2fba72d53e38e77fbe776270218",
		span_id:"h_1f51e2fba72d53e38e77fbe776270218",
		href:"trinidad-in-bolivia-c17598.htm",
		script_widget:"1f51e2fba72d53e38e77fbe776270218"
	},
	cobija:{
		div_id:"cont_d64d6348d527a396290e0a159d6220e4",
		span_id:"h_d64d6348d527a396290e0a159d6220e4",
		href:"centro.htm",
		script_widget:"d64d6348d527a396290e0a159d6220e4"
	},
	madrid:{
		div_id:"cont_24e03472e0c4bfd4a7dc1f27a2200da8",
		span_id:"h_24e03472e0c4bfd4a7dc1f27a2200da8",
		href:"madrid-in-spain-c313.htm",
		script_widget:"24e03472e0c4bfd4a7dc1f27a2200da8"
	},
	salta:{
		div_id:"cont_a53e8a17eb04ad0571fba280e933dca0",
		span_id:"h_a53e8a17eb04ad0571fba280e933dca0",
		href:"salta.htm",
		script_widget:"a53e8a17eb04ad0571fba280e933dca0"
	},
	bs_as:{
		div_id:"cont_591d58663bb9a80e3f40244f09e3da1b",
		span_id:"h_591d58663bb9a80e3f40244f09e3da1b",
		a_id:"a_591d58663bb9a80e3f40244f09e3da1b",
		href:"buenos-aires-in-argentina-c13584.htm",
		script_widget:"591d58663bb9a80e3f40244f09e3da1b"
	},
	sao_paulo:{
		div_id:"cont_2536d522b4695e3b3143970d3b8cd3e2",
		span_id:"h_2536d522b4695e3b3143970d3b8cd3e2",
		href:"sao-paulo-in-brazil-c115701.htm",
		script_widget:"2536d522b4695e3b3143970d3b8cd3e2"
	},
	miami:{
		div_id:"cont_ea0052659be43a1ab4046f0add383c58",
		span_id:"h_ea0052659be43a1ab4046f0add383c58",
		a_id:"a_ea0052659be43a1ab4046f0add383c58",
		href:"miami-c11129.htm",
		script_widget:"ea0052659be43a1ab4046f0add383c58"
	}
}
// ---------------------= =---------------------
function create_weather_cell(key)
{
	var data = weather_table[key];

	var td = document.createElement("td");
	$(td).addClass("weather-cell").attr("align","center");

	var div = document.createElement("div");
	$(div).attr("id",data.div_id);
	td.appendChild(div);

	var span = document.createElement("span");
	$(span).attr("id",data.span_id);
	div.appendChild(span);

	var anchor = document.createElement("a");
	$(anchor).attr("href","http://www.theweather.com/" + data.href)
			 .attr("target","_blank")
			 .css("color","#656565")
			 .css("font-family","2") // wtf, i know!
			 .css("font-size","14px");

	if('a_id' in data)
		$(anchor).attr("id",data['a_id']);

	span.appendChild(anchor);

	var script = document.createElement("script");
	$(script).attr("type","text/javascript")
		     .attr("src","http://www.theweather.com/wid_loader/" + data.script_widget);
	div.appendChild(script);

	return td;
}
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------