<?php 

	$r = fgets(fopen("nearest_dates.json","r"));

	$decoded = json_decode($r,true);

	echo json_encode($decoded);

	// sleep(1);
?>