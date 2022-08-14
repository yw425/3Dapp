
        function change_viewport(where){
            if(where === 'T'){
                document.getElementById('top').setAttribute('set_bind','true');
            } else if(where === 'F'){
                document.getElementById('front').setAttribute('set_bind','true');
            } else if(where === 'L'){
                document.getElementById('left').setAttribute('set_bind','true');
            }
        }

        let index = 0;
        function up_item(){
            index++;
            if(index > 2){
                index = 0;
            }
            change_item(index);
        }
        function down_item(){
            index--;
            if(index < 0){
                index = 2;
            }
            change_item(index);
        }

        function SwitchAnimation(id){
            console.log("!");
            //$('#tonode').attr('toNode', 'anima' + id);
            let isWork = $('#anima_timer').attr('enabled');
            if(isWork == 'false')
                $('#anima_timer').attr('enabled','true');
            else
                $('#anima_timer').attr('enabled','false');
        }

        function change_item(index){
            console.log(index);
            $('#model_selector').attr('whichChoice', index);
        }

        let is_light = true;
        function switch_light(){
            if(is_light){
                document.getElementById('point').setAttribute('on','false');
                document.getElementById('light_img').src = './img/light-off.svg';
                is_light = false;
            } else {
                document.getElementById('point').setAttribute('on','true');
                document.getElementById('light_img').src = './img/light.svg';
                is_light = true;
            }
        }

        let isWireframe = false;
        function change_wireframe(){
            let e = document.getElementById('x3dElement');
            if(isWireframe)
            {
                e.runtime.togglePoints(true);
                $('#line_img').attr('src', './img/box-l.svg');
            }
            else
            {
                e.runtime.togglePoints(true);
                e.runtime.togglePoints(true);
                $('#line_img').attr('src', './img/box-f.svg');
            }
            isWireframe = !isWireframe;
        }

