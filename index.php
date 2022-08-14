<?php
	if($_GET){
		$id = $_GET['id'];
		require('model.php');
		$model = new Model();
		$data = $model->getData($id);
		echo $data;
		return;
	}
	if($_POST){
		$json = '{"info":"3DApp build by X3Dom"}';
		echo $json;
		return;
	}
	else{
		require('view.php');
	}

?>

