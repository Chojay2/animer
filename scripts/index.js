const animeContainer = document.querySelector(".anime");
const cardContainer = document.querySelector(".anime--cards");
const likedAnimeList = document.getElementById("likedAnimeList");
const downloadList = document.getElementById("downloadList");

let data = [];
let likedAnime = [];
let dislikedAnime = [];
let currentPage = 1;

async function fetchApi(currentPage) {
  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/top/anime?page=${currentPage}&filter=bypopularity`
    );
    let fetchedData = await response.json();
    data = [...data, ...fetchedData.data];
    console.log(data);

    initCards(data);
  } catch (error) {
    console.error("Error fetching API:", error);
  }
}

function initCards(animeData) {
  createAnimeCards(animeData);
  animeContainer.classList.add("loaded");
}

function createAnimeCards(animeDetails) {
  cardContainer.innerHTML = "";
  animeDetails.forEach((animeItem, index) => {
    const animeCard = createCardElement(animeItem, index);
    actions(animeCard);
    cardContainer.appendChild(animeCard);
  });
}

function createCardElement(animeItem, index) {
  const animeCard = document.createElement("div");
  animeCard.classList.add("anime--card");
  animeCard.style.zIndex = data.length - index;
  animeCard.style.transform = `scale(${(20 - index) / 20}) translateY(-${
    30 * index
  }px)`;
  animeCard.style.opacity = (10 - index) / 10;
  animeCard.innerHTML = `
    <img src="${animeItem.images.jpg.image_url}" width="400px" height="450px">
    <h3>${animeItem.title}</h3>
  `;
  return animeCard;
}

function createLikedAnimeList(likedAnime) {
  const listCard = document.createElement("div");
  likedAnimeList.style.opacity = "1";
  listCard.classList.add("list--card");
  listCard.innerHTML = `
    <img src="${likedAnime.images.jpg.image_url}" width="70px" height="70px" crossorigin="anonymous">
    <div>
    <p>${likedAnime.title}</p>
    </p>${likedAnime.aired.string}</p>
    </div>
  `;
  likedAnimeList.appendChild(listCard);
}
function nextPage() {
  currentPage++;
  console.log(currentPage);
  fetchApi(currentPage);
}

function actions(el) {
  let hammertime = new Hammer(el);

  hammertime.on("pan", function (event) {
    el.classList.add("moving");
  });

  hammertime.on("pan", function (event) {
    if (event.deltaX === 0) return;
    if (event.center.x === 0 && event.center.y === 0) return;

    animeContainer.classList.toggle("anime_love", event.deltaX > 0);
    animeContainer.classList.toggle("anime_nope", event.deltaX < 0);

    let xMulti = event.deltaX * 0.03;
    let yMulti = event.deltaY / 80;
    let rotate = xMulti * yMulti;

    event.target.style.transform =
      "translate(" +
      event.deltaX +
      "px, " +
      event.deltaY +
      "px) rotate(" +
      rotate +
      "deg)";
  });

  hammertime.on("panend", function (event) {
    el.classList.remove("moving");
    animeContainer.classList.remove("anime_love");
    animeContainer.classList.remove("anime_nope");

    let moveOutWidth = document.body.clientWidth;
    let keep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

    event.target.classList.toggle("removed", !keep);

    if (keep) {
      event.target.style.transform = "";
    } else {
      let endX = Math.max(
        Math.abs(event.velocityX) * moveOutWidth,
        moveOutWidth
      );
      let toX = event.deltaX > 0 ? endX : -endX;
      let endY = Math.abs(event.velocityY) * moveOutWidth;
      let toY = event.deltaY > 0 ? endY : -endY;
      let xMulti = event.deltaX * 0.03;
      let yMulti = event.deltaY / 80;
      let rotate = xMulti * yMulti;

      event.target.style.transform =
        "translate(" +
        toX +
        "px, " +
        (toY + event.deltaY) +
        "px) rotate(" +
        rotate +
        "deg)";

      data = data.filter((item) => {
        const isMatch = item.title === el.querySelector("h3").textContent;

        if (!isMatch) return true;

        if (event.deltaX > 0) {
          likedAnime.push(item);
          createLikedAnimeList(item);
        }
        if (event.deltaX < 0) {
          dislikedAnime.push(item);
        }
        return false;
      });

      data.length === 3 && nextPage();
      initCards(data);
    }
  });
}


function captureAndDownload() {
  let nodeToCapture = document.getElementById("likedAnimeList");
  nodeToCapture.style.overflow = "auto";

  html2canvas(nodeToCapture).then(function (canvas) {
    const imageDataUrl = canvas.toDataURL();
    const downloadLink = document.createElement("a");

    downloadLink.href = imageDataUrl;

    downloadLink.download = "snapshot.png";

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
  });
  nodeToCapture.style.overflow = "hidden";
}

downloadList.addEventListener("click", captureAndDownload);

fetchApi(currentPage);
