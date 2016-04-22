
	/**
	* Compute a parametric bezier curve (parameter t) for the given array of control points p
	*/
	function Bezier(t, p) {
	  var order = p.length - 1; // curve order is number of control point - 1
	  var d = p[0].length;      // control point dimensionality

	  // create a source vector array copy that will be
	  // used to store intermediate results
	  var v = p.map(function(point) {
		return point.slice();
	  });

	  // for each order reduce the control point array by updating
	  // each control point with its linear interpolation to the next
	  for(var i=order; i>0; i--) {
		for(var j=0; j<order; j++) {
		  // interpolate each component
		  for(k=0; k<d; k++) {
			v[j][k] = (1 - t) * v[j][k] + t * v[j+1][k];
		  }
		}
	  }

	  return v[0];
	}

	/**
	* Computes an exponentially decaying cosine curve to simulate "overshoot"
	* Assumes x starts at 0.0
	*/
	var Overshoot = function(x, amplitude, period, stretch, decay)
	{
		var c = Math.cos((2*Math.PI/(period*1.0))*x)
		var p = amplitude*c;
		var y = Math.exp(decay*(x/50.0))*p;
		return y;
	} 


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

	/**
	* Computes a 3 control point bezier curve as the displacement function
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
		  var point = Bezier(t/(opt.number_of_frames*1.0), this.control_points);
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

	//
	// Bezier deceleration with overshoot oscillation
	//
	var OSD = function(options)
	{

		var os_value = options.os_value;
		var os_length = options.os_length;
		var os_period = options.os_period;
		
		var opt = {};
		opt.over=false;
		opt.initial_velocity = options.initial_velocity;
		opt.number_of_frames = options.number_of_frames - os_length;
		opt.total_rotation_required = options.total_rotation_required + os_value;
		opt.alpha = 1.0;

		var decel = new QuadraticBezierDecelerator(opt);
		this.evaluate = function(x)
		{
			if( x < opt.number_of_frames )
				return decel.evaluate(x);
			else{
				var y = opt.total_rotation_required - os_value + Overshoot(x - opt.number_of_frames, os_value, os_period, 1, -1)	
				return y;
			}
		}
	
	}

	module.exports =  {
		plain: QuadraticBezierDecelerator,
		osd : OSD
	}

