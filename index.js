var Spline = require('./spline')
var util = require('util')
var Decelerator = require('./Decelerator');
var spline = Spline;

var bezier = require('bezier-curve');
util.inspect(Decelerator)

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

/*
* More generally how to set up this deceleration.
*
* Need three points 
*	The first point MUST be 
* 		[0.0, 0.0] 
*
*	The THIRD point MUST be
*		[number_of_frames, total_rotation_required]
*
*	The easy choice for the SECOND point is:
*		[total_rotation_required / initial_velocity, total_rotations_required]
*
*	Other choices are possible for the second point and the choice will change the shape of the curve
*	the only possible choices are however of the form:
*
*		[ (total_ratation_required/initial_velocity) * ALPHA, total_rotations_required * ALPHA ]
*
*	where ALPHA is between zero and 1.0
*/

var decelerator_options= {
	number_of_frames : 240,
	total_rotation_required : 1530,
	initial_velocity : 18 , // degrees per frame
	alpha : 0.5
}


var decel = new Decelerator(decelerator_options);

var i;
for(i = 0; i <= 240; i++)	
  console.log(" i: " + i + " value : " + (decel.evaluate(i)))

/**
* So how do you use this function.
*/
