import { ExponentialCost, FirstFreeCost, FreeCost, LinearCost } from "../api/Costs";
import { Localization } from "../api/Localization";
import { parseBigNumber, BigNumber } from "../api/BigNumber";
import { theory } from "../api/Theory";
import { Utils } from "../api/Utils";

var id = "temperature_control";
var name = "Temperature Control";
var description = 
"Control Theory is a tool used in engineering to maintain a variable at a set value (known as the 'set point'). \n \n \
\
To make progress, you will need to disturb T to change rho. \
You will also need to grow the variable 'r', this grows faster when T is close to the setpoint, T_sp. \
\n \n \
The controller works by calculating the error, e(t) between T and the set point, T_sp. \
The controller used in this theory will be a PID -- proportional, integral and derivative controller. \
K_p represents the proportional gain of the system - in other words how much the output changes depending on the error sum within the brackets. \
The integral term sums up the past errors and attempts to minimise the error after t_i seconds.\
 The derivative term attempts to predict the future \error after t_d seconds based on the current derivative of e(t). \
At some point you will also be able to manually change the values k_p, t_i, t_d, \
and T_sp to explore the system more deeply and to improve rho gain.\n \n \
\
In this theory, you will assume that this is a temperature control system. \
The PID controller either heats the system to raise temperature, or cools the system to lower temperature. \
This decision is based on the measured error e(t) and the output, u(t), is modelled as a percentage between -100% and 100%. \
";

var authors = "Gaunter#7599, peanut#6368 - developed the theory \n XLII#0042, SnaekySnacks#1161 - developed the sim and helped balancing";
var version = "1.5.2";
var publicationExponent = 0.2;
var achievements;
requiresGameVersion("1.4.29");
// Currency
var rho;

var c1;
var q = BigNumber.ONE;

var init = () => {
  currency = theory.createCurrency();

  /////////////////////
  // Upgrades

  // c1
  {
    let getDesc = (level) => "c_1= "+ getC1(c1.level);
    let getInfo = (level) => "c_1=" + getC1(level).toString();
    c1 = theory.createUpgrade(1, rho, new ExponentialCost(1e5, Math.log2(18)));
    c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
    c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
  }

  ////////////////////////////
  // Story Chapters

  
}

var updateAvailability = () => {
    //set that milestone
}

var tick = (elapsedTime, multiplier) => {
  let dt = BigNumber.from(elapsedTime * multiplier);
  q += BigNumber.ONE;
  currency.value += dt * getC1(c1.level) *
                         q.sqrt()
}

var getPrimaryEquation = () => {
  let result = "\\dot{\\rho} = c_1";

  result += " \\sqrt{q}"; 

  return result;
}
