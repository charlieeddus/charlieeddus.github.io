const list = document.getElementById("items");
const duplicatesList = document.getElementById("duplicates");
const count = document.getElementsByClassName("count")[0];
const duplicatesCount = document.getElementsByClassName("duplicates-count")[0];
const recent = document.getElementById("recent");
const limit = 200;
let offset = 0;
let podcasts = []

let searchTerm = document.getElementsByClassName("search-term")[0]
searchTerm.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') { search(); }
});

let searchCountry = document.getElementsByClassName("search-country")[0]
let searchType = document.getElementsByClassName("search-type")[0]
let button = document.getElementsByClassName("search-button")[0]
button.addEventListener('click', search)

searchTerm.focus()

function reset() {
  // Clear the list before new search
  list.innerHTML = null
  duplicatesList.innerHTML = null
  offset = 0
  podcasts = []
}

function search() {
  if (searchTerm.value.length < 1) { return }

  reset()

  fetchPodcasts()
}

function fetchPodcasts() {
  count.innerHTML = "Loading..."

  fetch(
    "https://itunes.apple.com/search?" +
      new URLSearchParams({
        term: `${searchTerm.value}`,
        media: "podcast",
        country: `${searchCountry.value}`,
        attribute: `${searchType.value}`,
        limit: `${limit}`,
        offset: `${offset}`
      })
  )
    .then((response) => response.json())
    .then((data) => {
      const results = data.results;

      podcasts.push(...results)

      if (results.length >= limit) {
        offset += limit;

        fetchPodcasts();
      } else {
        let duplicates = []
        const sortedPodcasts = podcasts
          .filter(podcast => {
            const unwantedGenres = [
              "Business",
              "Music",
              "Government",
              "Performing Arts",
              "Daily News",
              "Relationships",
              "Courses",
              "News Commentary",
              "Basketball",
              "News",
              "Improv",
              "Islam",
              "Investing",
              "Management",
              "Language Learning",
              "Education",
              "Fiction"
            ];

            return !unwantedGenres.includes(podcast.genres[0])
          })
          .filter(podcast => {
            if (!recent.checked) { return true }

            const podcastDate = new Date(podcast.releaseDate);
            const currentDate = new Date();

            let validDate = currentDate
            validDate.setMonth(currentDate.getMonth() - 12)

            return podcastDate > validDate
          })
          .sort((a, b) => (a.releaseDate < b.releaseDate) ? 1 : -1)

        count.innerHTML = sortedPodcasts.length + " podcasts"

        for (const podcast of sortedPodcasts) {
          addElement(podcast);
        }

        if (duplicates.length > 0) {
          duplicatesCount.innerHTML = duplicates.length + " possible duplicate" + (duplicates.length > 1 ? "s" : "")
          
          for (const podcast of duplicates) {
            addDuplicate(podcast)
          }
        }
      }
    });
}

function createElement(podcast) {
  const newPodcast = document.createElement("a");
  newPodcast.setAttribute("class", "item");
  newPodcast.setAttribute("href", podcast.trackViewUrl);

  const image = document.createElement("img");
  image.setAttribute("class", "image");
  image.setAttribute("src", podcast.artworkUrl600);

  const metadata = document.createElement("div");
  metadata.setAttribute("class", "metadata");

  const title = document.createElement("p");
  title.setAttribute("class", "name");
  title.innerText = podcast.trackName;

  const genre = document.createElement("p");
  genre.setAttribute("class", "genre");
  genre.innerText = podcast.genres[0];

  const latestRelease = document.createElement("p");
  latestRelease.setAttribute("class", "latest-release");
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const newDate = new Date(podcast.releaseDate);
  latestRelease.innerText = newDate.toLocaleDateString("sv-SE", options);

  metadata.appendChild(title);
  metadata.appendChild(genre);
  metadata.appendChild(latestRelease);

  newPodcast.appendChild(image);
  newPodcast.appendChild(metadata);

  return newPodcast
}

function addElement(podcast) {
  const newPodcast = createElement(podcast)
  list.appendChild(newPodcast);
}

function addDuplicate(podcast) {
  const newDuplicate = createElement(podcast)
  duplicatesList.appendChild(newDuplicate)
}
