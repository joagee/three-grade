/**
 * egg.js
 * Renders egg character with pure CSS. Q-bounce animation, 5 colors, 3 expressions.
 * No image assets. Egg form factor inspired by the Eggy Party aesthetic
 * (round bottom-heavy rounded shapes, big eyes) without copyright infringement.
 *
 * Usage:
 *   App.egg.render(container, {
 *     color: 'yellow', // 'yellow'|'pink'|'blue'|'green'|'purple'
 *     expression: 'happy', // 'happy'|'cool'|'surprised'
 *     size: 'lg', // 'sm'|'md'|'lg' (default 'md')
 *     accessories: [] // later: list of accessory ids
 *   });
 *
 * Returned DOM has class "egg" — external CSS in styles.css handles styling.
 */

const EGG_COLORS = {
  yellow: { body: "#FFD93D", bodyDark: "#F5B800", shade: "#FFE066" },
  pink:   { body: "#FF9F9F", bodyDark: "#E07878", shade: "#FFB8B8" },
  blue:   { body: "#6BCBEF", bodyDark: "#3FA9D6", shade: "#A0DDF5" },
  green:  { body: "#95E06C", bodyDark: "#5FA83F", shade: "#B8E89A" },
  purple: { body: "#C8A2FF", bodyDark: "#A578E0", shade: "#E0C0FF" }
};

const EGG_SIZE_PX = { sm: 80, md: 120, lg: 180 };

const EGG_EXPRESSIONS = {
  happy:     { eye: "egg-eye egg-eye-happy",     mouth: "egg-mouth egg-mouth-happy" },
  cool:      { eye: "egg-eye egg-eye-cool",      mouth: "egg-mouth egg-mouth-cool" },
  surprised: { eye: "egg-eye egg-eye-surprised", mouth: "egg-mouth egg-mouth-surprised" }
};

function renderEgg(container, options = {}) {
  const color = options.color && EGG_COLORS[options.color] ? options.color : "yellow";
  const expression = options.expression && EGG_EXPRESSIONS[options.expression]
    ? options.expression : "happy";
  const sizeKey = options.size && EGG_SIZE_PX[options.size] ? options.size : "md";
  const size = EGG_SIZE_PX[sizeKey];

  const palette = EGG_COLORS[color];
  const exp = EGG_EXPRESSIONS[expression];

  container.innerHTML = "";

  const egg = document.createElement("div");
  egg.className = "egg egg-size-" + sizeKey;
  egg.style.setProperty("--egg-size", size + "px");
  egg.style.setProperty("--egg-body", palette.body);
  egg.style.setProperty("--egg-body-dark", palette.bodyDark);
  egg.style.setProperty("--egg-shade", palette.shade);

  const shine = document.createElement("div");
  shine.className = "egg-shine";

  const feet = document.createElement("div");
  feet.className = "egg-feet";
  const footL = document.createElement("span");
  footL.className = "egg-foot egg-foot-left";
  const footR = document.createElement("span");
  footR.className = "egg-foot egg-foot-right";
  feet.append(footL, footR);

  const face = document.createElement("div");
  face.className = "egg-face";

  const eyeL = document.createElement("span");
  eyeL.className = exp.eye + " egg-eye-left";
  const eyeR = document.createElement("span");
  eyeR.className = exp.eye + " egg-eye-right";
  const mouth = document.createElement("span");
  mouth.className = exp.mouth;

  face.append(eyeL, eyeR, mouth);
  egg.append(shine, feet, face);
  container.append(egg);
  return egg;
}

const egg = {
  render: renderEgg,
  COLORS: EGG_COLORS,
  EXPRESSIONS: EGG_EXPRESSIONS
};

window.App = window.App || {};
window.App.egg = egg;
