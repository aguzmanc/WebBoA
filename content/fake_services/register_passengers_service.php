<?php
	echo json_encode(array (
		'success'=>true,
		'pnr' => '999MMM',
		'banks' => array (
			'bcp' => array (
				'enabled' => true,
				'msg' => "mensaje de prueba"
			),
			'bnb' => array (
				'enabled' => false,
				'msg' => "mensaje de prueba"
			),
			'economico' => array (
				'enabled' => true,
				'msg' => "mensaje de prueba"
			)
		)
	));

	sleep(0.2);
?>