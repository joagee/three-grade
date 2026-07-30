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

const ACCESSORIES = [
  { id: "hat_crown",  type: "hat",      name: "皇冠",   emoji: "👑", rarity: 3 },
  { id: "hat_party",  type: "hat",      name: "派对帽", emoji: "🎉", rarity: 1 },
  { id: "hat_wizard", type: "hat",      name: "巫师帽", emoji: "🎩", rarity: 2 },
  { id: "glass_cool", type: "glasses",  name: "酷墨镜", emoji: "🕶",  rarity: 1 },
  { id: "glass_heart",type: "glasses",  name: "爱心镜", emoji: "💕", rarity: 2 },
  { id: "glass_star", type: "glasses",  name: "星星镜", emoji: "🤩", rarity: 1 },
  { id: "back_bag",   type: "backpack", name: "小红包", emoji: "🎒", rarity: 2 },
  { id: "back_clover",type: "backpack", name: "幸运草", emoji: "🍀", rarity: 1 },
  { id: "fx_sparkle", type: "effect",   name: "闪闪亮", emoji: "✨", rarity: 2 },
  { id: "fx_rainbow", type: "effect",   name: "彩虹圈", emoji: "🌈", rarity: 3 },
];

function getAccessory(id) {
  return ACCESSORIES.find(a => a.id === id) || null;
}

function getAllAccessories() {
  return ACCESSORIES.slice();
}

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
  // 只设置颜色, 不用内联 size 覆盖 CSS class; 让 styles.css 媒体查询能自由缩
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

  // Accessory overlays
  const accs = options.accessories || [];
  accs.forEach(accId => {
    const acc = getAccessory(accId);
    if (!acc) return;
    const overlay = document.createElement("div");
    overlay.className = "egg-accessory accessory-" + acc.type;
    overlay.textContent = acc.emoji;
    overlay.setAttribute("aria-label", acc.name);
    overlay.dataset.accId = accId;
    egg.appendChild(overlay);
  });

  container.append(egg);
  return egg;
}

const egg = {
  render: renderEgg,
  getAccessory,
  getAllAccessories,
  ACCESSORIES,
  COLORS: EGG_COLORS,
  EXPRESSIONS: EGG_EXPRESSIONS
};

window.App = window.App || {};
window.App.egg = egg;
