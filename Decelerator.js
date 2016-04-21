var bezier = require('bezier-curve');

/**
* This object calculates the deceleration profile for the purposes of animation.
*
*	we wish to take an graphical object that has an 
*	-	initial velocity of 'initial_velocity' ( velocity is measured in units/frame) 
*	-	decelerate it to a final velocity of 0.0 units/frame
*	-	have this deceleration take place over a period of 'number_of_frames'
*	-	an travel a total distance of 'total_rotation_required' during the deceleration
*
*	After the initial setup the "evaluate" method provides a quadratic bezier function that described distance_traveled
*	as a function of frame number. 
*
*	The way this is used is as follows:
*
*		let p0 be the displacement (in whatever units are appropriate) of the object to be decelerated 
*			the instant before deceleration starts
*
*		the displacement of the object in the i-th frame of the deceleration period is
*			pi = p0 + QuadraticBezierDecelerator.evaluate(i)
*
* options
*	initial_velocity
*	number_of_frames
*	total_rotation_required
* 	alpha - see below
*
*/
/*
* More generally how to set up this deceleration.
*
* The algorithm needs three CONTROL points 
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
*	but the choice must be of the form:
*
*		[ (total_ratation_required/initial_velocity) * ALPHA, total_rotations_required * ALPHA ]
*
*	where ALPHA is between zero and 1.0
*/

var QuadraticBezierDecelerator = function(options)
{
	var opt = options;

	this.control_points = [
	  [0.0,  0.0],
	  [(opt.total_rotation_required/opt.initial_velocity) * opt.alpha, opt.total_rotation_required * opt.alpha],
	  [opt.number_of_frames * 1.0, opt.total_rotation_required],
	]
	this.value_points = [];
	/*
	* The bezier-curve module provides a function that uses a curve length parameter called t which is NOT the same as 
	* time. We have to calculate a table of [t, f(t)] values
	*/
	for(var t=0; t<=opt.number_of_frames; t++) {
	  var point = bezier(t/(opt.number_of_frames*1.0), this.control_points);
	  this.value_points[t] = point;
	}
	
	/*
	* And then linearly interpolate between the points in that array
	*/
	this.evaluate = function(x){
		var vp = this.value_points;
		
		var i;
		var found=false;
		/*
		* Find the adjacent points whose x-cord lie each side of the x value we are interested in
		*/
		for(i = 1; i <= opt.number_of_frames; i++){
			//console.log("x: " + x + " vp[i-1] : " + vp[i-1][0] + "  vp[i] : " + vp[i][0])
			if( vp[i-1][0] <=x && x <= vp[i][0] ){
				//console.log("found : " + i + " x: " + x)
				found = true;
				break
			}
		}
		if( ! found) throw("Decelerator: FAILED to find x value in table")
		/*
		* Now linear interpolate between the points either side of the x-value of interest
		*
		* this is just an application of a straight line equation eg
		*
		* 	y = (y2-y1)/(x2-x1) * (x - x1) + y2
		*
		*/
		var y = ((vp[i][1] - vp[i-1][1])/( vp[i][0]-vp[i-1][0]))*(x-vp[i-1][0]) + vp[i-1][1]
	
		return y;
	}
		
}

module.exports=exports=QuadraticBezierDecelerator;

