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
		$json = '{"info":"3DApp build by X3Dom.This web page was originally created by Yixiang Wang and is only used as a display for Web 3D Applications assignment. <br/>Github: <a href=\"https://github.com/yw425/3Dapp\" style=\"color:#00c4ff;\" class=\"btn btn-link\">https://github.com/yw425/3Dapp</a>"}';
		echo $json;
		return; 
	}
	else{
		require('view.php');
	}

?>

