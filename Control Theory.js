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

var init = () => {
  rho = theory.createCurrency();
  initialiseSystem();

  /////////////////////
  // Milestone Upgrades

  theory.setMilestoneCost(new CustomCost(total => BigNumber.from(getCustomCost(total))));
  // T Autokick
  {
    autoKick = theory.createMilestoneUpgrade(0, 1);
    autoKick.maxLevel = 1;
    autoKick.getDescription = (_) => "Automatically adjust T";
    autoKick.getInfo = (_) => "Automatically adjusts T";
    autoKick.boughtOrRefunded = (_) => { updateAvailability(); theory.invalidatePrimaryEquation(); }
    autoKick.canBeRefunded = () => false;
  }
  {
    c1Exponent = theory.createMilestoneUpgrade(1, 3);
    c1Exponent.getDescription = (_) => Localization.getUpgradeIncCustomExpDesc("c_1", 0.05)
    c1Exponent.getInfo = (_) => Localization.getUpgradeIncCustomExpInfo("c_1", "0.05")
    c1Exponent.boughtOrRefunded = (_) => { updateAvailability(); theory.invalidatePrimaryEquation(); }
  }

  {
    r1Exponent = theory.createMilestoneUpgrade(2, 3);
    r1Exponent.getDescription = (_) => Localization.getUpgradeIncCustomExpDesc("r_1", 0.05);
    r1Exponent.getInfo = (_) => Localization.getUpgradeIncCustomExpInfo("r_1", "0.05");
    r1Exponent.boughtOrRefunded = (_) => { updateAvailability(); theory.invalidatePrimaryEquation(); }
  }
  {
    r2Exponent = theory.createMilestoneUpgrade(3, 2);
    r2Exponent.getDescription = (_) => Localization.getUpgradeIncCustomExpDesc("r_2", r2ExponentScale);
    r2Exponent.getInfo = (_) => Localization.getUpgradeIncCustomExpInfo("r_2", r2ExponentScale);
    r2Exponent.boughtOrRefunded = (_) => { updateAvailability(); theory.invalidatePrimaryEquation(); }
    r2Exponent.canBeRefunded = () => unlockR3.level == 0 && rExponent.level == 0;
  }
  {
    c1BaseUpgrade = theory.createMilestoneUpgrade(4, 2);
    c1BaseUpgrade.getInfo = (_) => "Increases $c_1$ base by " + 0.125;
    c1BaseUpgrade.getDescription = (_) => "$\\uparrow \\ c_1$ base by " + 0.125;
    c1BaseUpgrade.boughtOrRefunded = (_) => updateAvailability();
    c1BaseUpgrade.canBeRefunded = () => unlockR3.level == 0 && rExponent.level == 0;
  }

  {
    rExponent = theory.createMilestoneUpgrade(5, 2);
    rExponent.getDescription = (_) => Localization.getUpgradeIncCustomExpDesc("r", 0.04);  }
    rExponent.getInfo = (_) => Localization.getUpgradeIncCustomExpInfo("r", 0.1);
    rExponent.boughtOrRefunded = (_) => { updateAvailability(); theory.invalidatePrimaryEquation();
  }
  {
    unlockR3 = theory.createMilestoneUpgrade(6, 1);
    unlockR3.getDescription = (_) => Localization.getUpgradeAddTermDesc("r_3");
    unlockR3.getInfo = (_) => Localization.getUpgradeAddTermInfo("r_3");
    unlockR3.boughtOrRefunded = (_) => { updateAvailability(); theory.invalidatePrimaryEquation(); }
  }


  /////////////////////
  // Permanent Upgrades

  theory.createPublicationUpgrade(1, rho, 1e8);

  // PID Menu Unlock
  {
    changePidValues = theory.createPermanentUpgrade(2, rho, new LinearCost(1e8, 0));
    changePidValues.maxLevel = 1;
    changePidValues.getDescription = (_) => Localization.getUpgradeUnlockDesc("\\text{PID Menu}");
    changePidValues.getInfo = (_) => Localization.getUpgradeUnlockInfo("\\text{PID Menu}");
  }

  theory.createBuyAllUpgrade(3, rho, 1e10);
  theory.createAutoBuyerUpgrade(4, rho, 1e20);

  // Achievement Multiplier
  {
    achievementMultiplierUpgrade = theory.createPermanentUpgrade(6, rho, new CustomCost(_ => BigNumber.from(1e250).pow(2)));
    achievementMultiplierUpgrade.maxLevel = 10;
    achievementMultiplierUpgrade.getDescription = (_) => "Achievement multiplier"
    achievementMultiplierUpgrade.getInfo = (_) => "Multiplies income by " + achievementMultiplier.toPrecision(3);
  }
  // Tdot exponent cap 
  {
    exponentCap = theory.createPermanentUpgrade(7, rho, new CustomCost((level) => {
      switch(level) {
        case 0: return BigNumber.TEN.pow(325);
        case 1: return BigNumber.TEN.pow(365);
        case 2: return BigNumber.TEN.pow(405);
        case 3: return BigNumber.TEN.pow(445);
        case 4: return BigNumber.TEN.pow(480);
        case 5: return BigNumber.TEN.pow(535);
        case 6: return BigNumber.TEN.pow(575);
        case 7: return BigNumber.TEN.pow(620);
        case 8: return BigNumber.TEN.pow(660);
        case 9: return BigNumber.TEN.pow(700);
    }
  }
      ));
    exponentCap.getDescription = (_) => Localization.getUpgradeIncCustomInfo("\\dot{T} \\text{ exponent cap}", 6)
    exponentCap.getInfo = (_) => Localization.getUpgradeIncCustomInfo("\\dot{T} \\text{ exponent cap}", 6)
    exponentCap.maxLevel = 10;
    exponentCap.boughtOrRefunded = (_) => { updateAvailability(); theory.invalidatePrimaryEquation(); }
  }

  /////////////////////
  // Upgrades

  // c1
  {
    let getDesc = (level) => "c_1= "+ (C1Base + c1BaseUpgrade.level * 0.125).toString() + "^{" + level + "}";
    let getInfo = (level) => "c_1=" + getC1(level).toString();
    c1 = theory.createUpgrade(1, rho, new ExponentialCost(1e5, Math.log2(18)));
    c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
    c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
  }

}

////////////////////////////
// Story Chapters

  var updateAvailability = () => {
    //set that milestone
  }



  


{
  // Equations

  var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 90;
    theory.primaryEquationScale = 1;
    let result = "\\begin{matrix}"

    let c1_exp = c1Exponent.level > 0 ? getC1Exp(c1Exponent.level).toNumber() : "";
    let r_exp = rExponent.level > 0 ? getRExp(rExponent.level).toNumber() : "";
    let r1_exp = r1Exponent.level > 0 ? getR1Exp(r1Exponent.level).toNumber() : "";
    let r2_exp = r2Exponent.level > 0 ? getR2Exp(r2Exponent.level).toNumber() : "";
    let r3_string = unlockR3.level > 0 ? "r_3": "";
    result += "\\dot{T} = \\left\\{ \\begin{array}{cl} u(t)Q_{h} & : \\ u(t) > 0, \\ Q_h = " + Th +" - T \\\\ u(t)Q_{c} & : \\ u(t) < 0, \\ Q_c = T- "+ Tc + "  \\end{array} \\right.\\\\";

    result += "\\dot{\\rho} = r^{" + r_exp + "}\\sqrt{c_1^{" + c1_exp +"}\\dot{T}^{" + getTdotExponent(tDotExponent.level) + "}}";
    result += ", \\;\\dot{r} = \\frac{r_1^{"+ r1_exp +"} r_2^{"+ r2_exp +"} "+ r3_string + "}{1+\\log_{10}(1 + \|e(t)\|)}"

    result += "\\end{matrix}"
    return result;
  }

  var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 75;
    theory.secondaryEquationScale = 0.9;
    let result = "\\begin{array}{c}";
    result += "e(t) = T_{sp} - T \\\\";
    result += "u(t) = K_p(e(t) + \\frac{1}{t_i}\\int_{0}^{t}e(\\tau)d\\tau \\ + t_d \\dot{e(t)})\\\\";
    result += theory.latexSymbol + "=\\max\\rho^{"+publicationExponent+"} , \\ K_p =" + kp.toPrecision(2) + ",\\ t_i =" + ti.toPrecision(2) + ",\\ t_d =" + td.toPrecision(2);
    result += "\\end{array}"
    return result;
  }

  var getTertiaryEquation = () => {
    let result = "";
    result += "T =" + Math.fround(T).toPrecision(5);
    result += ",\\,T_{sp} =" + setPoint.toPrecision(3) + ",\\ e(t) = " + Math.fround(error[0]).toPrecision(3);
    result += ",\\,\\epsilon =" + getTolerance(c1BaseUpgrade.level);
    result += ",\\, r ="+ r;
    return result;
  }
}
