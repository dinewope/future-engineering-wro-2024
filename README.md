# future-engineering-wro-2024
 This file would contain our solution to this year's game - self-driving cars.

Robot contains 2 motors at both sides,so robot could turn in every direction that it wants,as well as goes forward and backward. Two motors at B and C ports creates an opportunity for robot to move. However,robot could not do it itself,device called Gyroscope regulates the degree in which robot goes,so robot moves presicely in direction that was written in the code.
In case of turning right,B motor that is located in left side of the robot moves forward and C motor moves backward. Therefore, as robot moves gyroscope counts every degree and stops the robot when degree was bigger than 90 degree. That is the mechanism that works in open round
In case of round with obstacles, distance sensor sees if obstacle is around,but if sensor detactes that obstacle is in more than appropriate distance robot turns to another direction to see if there is obstacle. If there is an obstacle robot comes closer and with color sensor knows which color is it and goes backward. By detecting the color robot goes either right or left and by the gyroscope degree in which robot was going drives either B or C motor and returns to the place where it was to continue the cycle.
That cycle continues every time until the turn ends and repeates 3 times till the end.
