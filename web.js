var Decelerator = require("./Decelerator")

		var points_A = [
		  [0.0,  0.0],
		  [1530.0/18.0,  1530.0],
		  [240.0, 1530],
		  ];
		var points_B = [
		  [0.0,  0.0],
		  [1530.0/36.0,  1530.0/2.0],
		  [240.0, 1530],
		  ];
		var points = points_B

		var decelerator_options= {
			number_of_frames : 240,
			total_rotation_required : 1530,
			initial_velocity : 18 , // degrees per frame
			alpha : 0.5,
			over : false
		}


		var decel_1 = new Decelerator.plain(decelerator_options);
// 		
// 		decelerator_options.alpha = .75;		
// 		var decel_2 = new Decelerator(decelerator_options);

// 		decelerator_options.alpha = .95;	
// 		decelerator_options.over = true;	
			
		var decel_3 = new Decelerator.osd(decelerator_options);

		var i;
		var my_data = [["x","no overshoot", "overshoot"]];
		for(i = 0; i <= 240; i++){
			var y1 = decel_1.evaluate(i);
// 			var y2 = decel_2.evaluate(i);
			var y3 = decel_3.evaluate(i);
// 			my_data[i+1] = [i, y1, y2,y3];	
			my_data[i+1] = [i, y1, y3];
		}

	console.log(my_data)