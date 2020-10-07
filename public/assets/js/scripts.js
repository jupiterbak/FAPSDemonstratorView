(function($) {
    "use strict";

    /* 
    ------------------------------------------------
    Sidebar open close animated humberger icon
    ------------------------------------------------*/

    $(".hamburger").on('click', function() {
        $(this).toggleClass("is-active");
    });


    /*  
    -------------------
    List item active
    -------------------*/
    $('.header li, .sidebar li').on('click', function() {
        $(".header li.active, .sidebar li.active").removeClass("active");
        $(this).addClass('active');
    });

    $(".header li").on("click", function(event) {
        event.stopPropagation();
    });

    $(document).on("click", function() {
        $(".header li").removeClass("active");

    });



    /*  
    -----------------
    Chat Sidebar
    ---------------------*/


    var open = false;

    var openSidebar = function() {
        $('.chat-sidebar').addClass('is-active');
        $('.chat-sidebar-icon').addClass('is-active');
        open = true;
    }
    var closeSidebar = function() {
        $('.chat-sidebar').removeClass('is-active');
        $('.chat-sidebar-icon').removeClass('is-active');
        open = false;
    }

    $('.chat-sidebar-icon').on('click', function(event) {
        event.stopPropagation();
        var toggle = open ? closeSidebar : openSidebar;
        toggle();
    });


    $(".tdl-content a").on("click", function() {
        var _li = $(this).parent().parent("li");
        _li.addClass("remove").stop().delay(100).slideUp("fast", function() {
            _li.remove();
        });
        return false;
    });

    // for dynamically created a tags
    $(".tdl-content").on('click', "a", function() {
        var _li = $(this).parent().parent("li");
        _li.addClass("remove").stop().delay(100).slideUp("fast", function() {
            _li.remove();
        });
        return false;
    });



    /*  Chat Sidebar User custom Search
    ---------------------------------------*/

    $('[data-search]').on('keyup', function() {
        var searchVal = $(this).val();
        var filterItems = $('[data-filter-item]');

        if (searchVal != '') {
            filterItems.addClass('hidden');
            $('[data-filter-item][data-filter-name*="' + searchVal.toLowerCase() + '"]').removeClass('hidden');
        } else {
            filterItems.removeClass('hidden');
        }
    });


    /*  Chackbox all
    ---------------------------------------*/

    $("#checkAll").change(function() {
        $("input:checkbox").prop('checked', $(this).prop("checked"));
    });


    /*  Vertical Carousel
    ---------------------------*/

    $('#verticalCarousel').carousel({
        interval: 2000
    })

    $(window).bind("resize", function() {
        if ($(this).width() < 680) {
            $('.logo').addClass('hidden')
            $('.sidebar').removeClass('sidebar-shrink')
            $('.sidebar').removeClass('sidebar-shrink, sidebar-gestures')
        }
    }).trigger('resize');

    /*   Current Energy Flot
    -----------------------------------------*/
    var energy_data = {
        'energy_data_x_axis' :[],
        'energy_data_y_axis' : [],
        'energy_data_z_axis' : [],
        'energy_data_conveyor': [],
        'energy_data_components': []
    },
        totalPoints = 300;

    function addSingleData(_new_data, _label) {
        // Do a random walk
        while (energy_data[_label].length < totalPoints) {
            energy_data[_label].push(0.0);
        }

        if (energy_data[_label].length > 0){
            energy_data[_label] = energy_data[_label].slice(1);
        }  
        energy_data[_label].push(_new_data);
        // Zip the generated y values with the x values
        var res = [];
        for (var i = 0; i < energy_data[_label].length; ++i) {
            res.push([i, energy_data[_label][i]])
        }

        return res;
    }

    function addData(axis_x_data, axis_y_data, axis_z_data, conveyor_data, component_data) {
        var dataSet = [
            { label: "Axis X", data: addSingleData(axis_x_data,'energy_data_x_axis'), color: "#7EAADD" },
            { label: "Axis Y", data: addSingleData(axis_y_data,'energy_data_y_axis'), color: "#1e476c" },
            { label: "Axis Z", data: addSingleData(axis_z_data,'energy_data_z_axis'), color: "#d5e6b0" },
            { label: "Other Components", data: addSingleData(component_data,'energy_data_components'), color: "#96c139" },
            { label: "Conveyor", data: addSingleData(conveyor_data,'energy_data_conveyor'), color: "#5d7723" },            
        ];

        return dataSet;
    }

    // Set up the control widget
    var plot = $.plot("#energy-load", addData(0.0,0.0,0.0,0.0,0.0), {
        series: {
            stack: true,
            shadowSize: 0 // Drawing is faster without shadows
        },
        stack: true,
        yaxis: {
            min: 0
        },
        xaxis: {
            show: false
        },
        colors: ["#96c139"],
        lines: {
            fill: true, //Converts the line chart to area chart
            color: "#3c8dbc",
            lineWidth: 1
        },
        stack: true,
        grid: {
            color: "transparent",
            hoverable: true,
            borderColor: "#f3f3f3",
            borderWidth: 1,
            tickColor: "#f3f3f3"
        },
        
        tooltip: true,
        tooltipOpts: {
            content: "%y Watt",
            defaultTheme: false
        }
    });

    function update(axis_x_data, axis_y_data, axis_z_data, conveyor_data, component_data) {
        var _data = addData(axis_x_data, axis_y_data, axis_z_data, conveyor_data, component_data);
        plot.setData(_data);

        // Since the axes don't change, we don't need to call plot.setupGrid()
        plot.draw();
    }


    /* SocketIO 
    ----------------------------------------*/
    var OMACMode = {
		0: "Undefined",
		1: "Production",
		2: "Cloud",
		3: "Manual",
		16: "UserMode01",
		17: "UserMode02",
		18: "UserMode03",
		19: "UserMode04"		
	};
	
	var OMACState = {    
		0:"Undefined",
		1:"Clearing",
		2:"Stopped",
		3:"Starting",
		4:"Idle",
		5:"Suspended",
		6:"Execute",
		7:"Stopping",
		8:"Aborting",
		9:"Aborted",
		10:"Holding",
		11:"Held",
		12:"Unholding",
		13:"Suspending",
		14:"Unsuspending",
		15:"Resetting",
		16:"Completing",
		17:"Complete"
	};
    var socket = io('/');
    socket.on('connect', function(){});
    var executed_orders_count = 6584;
    var order_progess = 40;
    socket.on('new_image_processed', function(data){
        executed_orders_count = executed_orders_count + 1;
        order_progess = order_progess + 10;  
        if(order_progess > 100){
            order_progess = 100;
        }      
        $('#executed_order_count').text(executed_orders_count);
        $('#order_progess').attr("aria-valuenow",order_progess).css('width', order_progess + "%");
        $('#order_progess').text(order_progess + "% progress");
        if(data.object && data.url){
            var _target = $("#" + data.object);
            if(_target){
                _target.attr('src',data.url);
            }        
        }
        
    });

    /*    Update Energy Data
    ------------------------------------------------------*/
    var energy_count = 124.700;
    socket.on('AMQPMachineData', function(data) {
        var robot_data = data.robot.value;
        var conveyor_data = data.conveyor.value;

        // Collect the data
        var _Axis_X = Math.abs(robot_data.data? robot_data.data.Portal_Wirkleistung_L1/1000.0 : 5);
        var _Axis_Y = Math.abs(robot_data.data? robot_data.data.Portal_Wirkleistung_L2/1000.0 : 5);
        var _Axis_Z = Math.abs(robot_data.data? robot_data.data.Portal_Wirkleistung_L3/1000.0 : 5);
        var _Motor_Band_1 = Math.abs(conveyor_data?conveyor_data.DB33.Motor_Band_1_Power : 0);
        var _Motor_Band_2 = Math.abs(conveyor_data?conveyor_data.DB33.Motor_Band_2_Power : 0);
        var _Motor_Band_3 = Math.abs(conveyor_data?conveyor_data.DB33.Motor_Band_3_Power : 0);
        var _Motor_Umsetzer_11 = Math.abs(conveyor_data?conveyor_data.DB33.Motor_Umsetzer_11_Power : 0);
        var _Motor_Umsetzer_12 = Math.abs(conveyor_data?conveyor_data.DB33.Motor_Umsetzer_12_Power : 0);
        var _Motor_Umsetzer_21 = Math.abs(conveyor_data?conveyor_data.DB33.Motor_Umsetzer_21_Power : 0);
        var _Motor_Umsetzer_22 = Math.abs(conveyor_data?conveyor_data.DB33.Motor_Umsetzer_22_Power : 0);
        var _Robot_Components = 0.005;
        var _Conveyor_Component = 0.005;
        
        //Update the graph        
        update(
            _Axis_X, 
            _Axis_Y, 
            _Axis_Z, 
            _Motor_Band_1 + _Motor_Umsetzer_11 + _Motor_Umsetzer_12 + _Motor_Band_2 + _Motor_Umsetzer_21 + _Motor_Umsetzer_22 + _Motor_Band_3,
            _Robot_Components + _Conveyor_Component);

        // Compute the total energy
        var _cur_energy_value = _Axis_X + _Axis_Y + _Axis_Z + _Motor_Band_1 + _Motor_Umsetzer_11 + _Motor_Umsetzer_12 + _Motor_Band_2 + _Motor_Umsetzer_21 + _Motor_Umsetzer_22 + _Motor_Band_3 +_Robot_Components + _Conveyor_Component;
        energy_count = energy_count + (_cur_energy_value/1000.0);
        $('#energy_count').text(energy_count.toFixed(1));
        
		// updateNewValueInGraph(msg,"encoder_values_x");
		// updateNewValueInGraph(msg,"encoder_values_y");
		// updateNewValueInGraph(msg,"encoder_values_z");
		
		// updateNewValueInGraph(msg,"speed_x");
		// updateNewValueInGraph(msg,"speed_y");
		// updateNewValueInGraph(msg,"speed_z");
		
		// updateNewValueInGraph(msg,"acceleration_x");		
		// updateNewValueInGraph(msg,"acceleration_y");
		// updateNewValueInGraph(msg,"acceleration_z");
		
		// // OMAC
		$('#UnitModeCurrent_temp').text('' + OMACMode[robot_data.data['OmacUnitModeCurrent#']]);
		$('#StateCurrent_temp').text('' + OMACState[robot_data.data['OmacStateCurrent#']]);
    });

    socket.on('CurrentEnergyPrice', function(data) {
        $('#current_energy_price').text(data.toFixed(2) + ' EUR/kWh');
    });

    
    var conveyor_data = null;
    socket.on('GlobalData', function(data) {
        conveyor_data = data;
    });



    // socket.on('order_list', function(_list) {  
    //     // // Destroy the old table
    //     // if(last_table)
    //     //     last_table.clear();

    //     // var _target = $('#order_list tbody');
    //     // _target.empty();        
    //     // _list.forEach(function(element) {
    //     //     _target.append(" \
    //     //     <tr> \
    //     //         <th>" + element._id + "</th> \
    //     //         <th>" + element.OrderOwner + "</th> \
    //     //         <th>" + element.gifts.length + "</th> \
    //     //         <th>" + element.lastStatusUpdate +"</th> \
    //     //         <th>" + element.currentOrderStatus.status+"</th> \
    //     //     </tr> \
    //     //     ");
    //     // });
        
        
    // });
    var order_count = 9358;
    socket.on("new_order", function (_data) {
        order_count = order_count + 1;
        order_progess = 40;
        $('#order_progess').attr("aria-valuenow",order_progess).css('width', order_progess + "%");
        $('#order_progess').text(order_progess + "% progress");
        $('#order_count').text(order_count);
        $('#new_order_id').text(_data.order.order_id);
        $('#new_order_id_count').text(_data.order.list.length);
    });
    socket.on('disconnect', function(){});

    /*    Datatable
    ------------------------------------------------------*/
    var last_table = $('#order_list').DataTable({
        lengthMenu: [[5, 10, 20, 50, -1], [5, 10, 20, 50, "All"]],
        ajax: {
            'url' : "http://cloud.faps.uni-erlangen.de:3000/orders",
            "dataSrc": ""
        },
        "pageLength": 5,
        columns: [
           {"data": "_id"},
           {"data": "OrderOwner"},
           {"data": "gifts.length"},
           {"data": "currentOrderStatus.updated"},
           {"data": "currentOrderStatus.status"}
        ]
    });
    setInterval( function () {
        last_table.ajax.reload( null, false ); // user paging is not reset on reload
    }, 10000 );

    
    /*    Energy Simulation
    ------------------------------------------------------*/
    $('a[href="#search"]').on('click', function(event) {
        event.preventDefault();
        $('#search').addClass('open');
        $('#search > form > input[type="search"]').focus();
    });
    
    $('#search, #search button.close').on('click keyup', function(event) {
        if (event.target == this || event.target.className == 'close' || event.keyCode == 27) {
            $(this).removeClass('open');
        }
    });

    $('#start_price_simulation').on('click', function(event) {
        event.preventDefault();
        $.get( "EnergyPriceSimulation", { simulate: true, price: $('#sim_energy_price').val() })
        .done(function(){
            // Close the formular
            $('#search').removeClass('open');
        });        
    });

    $('#reset_price_simulation').on('click', function(event) {
        event.preventDefault();
        $.get( "EnergyPriceSimulation", { simulate: false, price: 0.0 })
        .done(function(){
            // Close the formular
            $('#search').removeClass('open');
        });        
    });
    
    
    //Do not include! This prevents the form from submitting for DEMO purposes only!
    $('form').submit(function(event) {
        event.preventDefault();
        return false;
    })

})(jQuery);