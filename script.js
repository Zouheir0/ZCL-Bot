function openSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

function addCrate() {
  const template = document.getElementById('crateTemplate');
  const clone = template.content.cloneNode(true);
  document.getElementById('crateList').appendChild(clone);
}

function addItem() {
  const template = document.getElementById('itemTemplate');
  const clone = template.content.cloneNode(true);
  document.getElementById('itemList').appendChild(clone);
}

function addCrateItem(btn) {
  const template = document.getElementById('itemTemplate');
  const clone = template.content.cloneNode(true);
  btn.parentElement.querySelector('.crate-items').appendChild(clone);
}

document.getElementById('saveForm').addEventListener('submit', function (e) {
  const crates = [];
  const crateElements = document.querySelectorAll('.crate');
  
  crateElements.forEach(crate => {
    const name = crate.querySelector('.crate-name').value;
    const rarity = parseFloat(crate.querySelector('.crate-rarity').value);
    const items = [];

    crate.querySelectorAll('.crate-items .item').forEach(item => {
      items.push({
        name: item.querySelector('.item-name').value,
        rarity: parseFloat(item.querySelector('.item-rarity').value),
        description: item.querySelector('.item-description').value
      });
    });

    crates.push({ name, rarity, items });
  });

  const items = [];
  document.querySelectorAll('#itemList .item').forEach(item => {
    items.push({
      name: item.querySelector('.item-name').value,
      rarity: parseFloat(item.querySelector('.item-rarity').value),
      description: item.querySelector('.item-description').value
    });
  });

  const config = { crates, items };
  document.getElementById('configData').value = JSON.stringify(config);
});