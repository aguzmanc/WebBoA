<?php

	$date = $_POST['fecha'];
	
	$res = array(
		"currency"=>"euro",
		"requested_date"=>$date,
		"flights"=>array( )
	);

	for($i=0;$i<rand(0,9);$i++) {
		$min = rand(360,1080);
		$max = rand($min+1, 1080);
		$price = rand(60,350);

		array_push($res["flights"], 
			array("salida" 	=> "" . sprintf('%02d',intval($min/60)) . "" . sprintf('%02d',($min%60)), 
			  "llegada"		=> "" . sprintf('%02d',intval($max/60)) . "" . sprintf('%02d',($max%60)),
			  "economica"	=> ((rand(0,1)==0) ? "none" : "".rand(60,350))
			)
		);
	}

	sleep(1);

	echo json_encode($res);

?>