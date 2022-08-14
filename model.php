<?PHP
    class Model{
        public function getData($id)
        {
            $filePath = "data/mySqlite.db";
            $sqlite = new SQLite3($filePath);
            if(!$sqlite){
                echo "错误状态码：".$sqlite->lastErrorCode();
                echo "错误信息：".$sqlite->lastErrorMsg();
                $sqlite->close();
                die("失败");
            }

            $id = str_ireplace(".x3d","",$id);
            $sql = "select * from x3d where id =".$id;
            $result = $sqlite->query($sql);
            $rows = $result->fetchArray(1);
            
            return $rows['xml'];
        }
    }

?>