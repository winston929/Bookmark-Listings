/*
* The class that loads the whole app
*/
class LoadApp{
  constructor(list){
    this.addLinkEvent(list);
  }
  /*
  * - Add link from the submitted form
  * - @param list - class from the script initialised on index.html
  */
  addLinkEvent(list){
    let submit = document.getElementById("submit");
    submit.onclick = (e) => {
      e.preventDefault();
      let link = new ValidateLink(list);

      if(link.validate()){
        link.addLink();
      }
    };
  }
}
/*
* The class that manages the whole listing functionality
*/
class List {
  constructor(){
    this.limit = 20;
    this.page = 1;
    this.start = 0;
    this.total = 0;

    this.totalPages = 0;

    this.listElem = document.getElementById("table_content");
    this.paginationElem = document.getElementById("pagination");

    this.useStorage = false;

    this.loadStorage();
    this.loadLinks();
  }
  /*
  * - Load storage from browser, and checks there is any local storage
  */
  loadStorage(){
    if (Storage) {
      let listings = localStorage.getItem("bookmark_listings");

      if(listings){
        this.listContent = JSON.parse(listings);
        this.createList(this.listContent);
        this.saveStorage(listings);
        this.useStorage = true;
      }
    }
  }
  /*
  * - Save storage when there are changes created from the user
  */
  saveStorage(text){
    if (Storage) {
      localStorage.setItem("bookmark_listings", text);
    }
  }
  /*
  * - Load the default links from the json file
  */
  loadLinks(){
    if(this.useStorage)
      return;

    let req = new XMLHttpRequest();
    req.addEventListener("load", () => {
      this.listContent = JSON.parse(req.responseText);
      this.saveStorage(req.responseText);
      this.createList(this.listContent);
    });
    req.open("GET", "default.json", true);
    req.send();
  }
  /*
  * - Add link when the data is fully validated from ValidateLink class
  * @param string name- Name of the website
  * @param string url- URL of the website
  */
  addLink(name, url){
    let link = this.listContent.links;
    let max = link.length - 1;
    link.push({
      "id": link[max].id,
      "name": name,
      "url": url,
      "timestamp": Date.now()
    });

    this.page = this.totalPages;
    this.saveStorage(JSON.stringify(this.listContent));
    this.createList(this.listContent);
  }
  /*
  * - Displays the list on the screen in paginated style
  * @param Object result- The full list of the websites
  */
  createList(result){
    while(this.listElem.rows.length > 1){
      this.listElem.deleteRow(1);
    }

    let link = result.links;

    this.total = link.length;
    this.start = (this.page - 1) * this.limit;

    for(let i = this.start;i < this.total;i++){
      let row = this.listElem.insertRow(-1);

      let website = row.insertCell(0);
      let url = row.insertCell(1);
      let dateAdded = row.insertCell(2);
      let removeLink = row.insertCell(3);

      website.innerHTML = link[i].name;
      url.innerHTML = '<a href="' + link[i].url + '">' + link[i].url + '</a>';

      let date = new Date(parseInt(link[i].timestamp));
      dateAdded.innerHTML = this.padding(date.getDate()) + "/" +
                            this.padding(date.getMonth() + 1) + "/" +
                            date.getFullYear();

      removeLink.innerHTML = '<a href="#">Remove</a>';
      removeLink.onclick = (e) => {
        e.preventDefault();
        this.removeLink(parseInt(link[i].id));
      };
    }
    this.showPagination();
  }
  /*
  * - Removes the link, when "Remove" option is selected
  * @param number id- auto generated id generated from the list
  */
  removeLink(id){
    let found = false;
    let link = this.listContent.links;
    for(let i = 0; i< link.length; i++){
      if(link[i].id == id){
        link.splice(i, 1);
        found = true;
        break;
      }
    }

    if(found){
      this.saveStorage(JSON.stringify(this.listContent));
      this.createList(this.listContent);
    }
  }
  /*
  * - Generates the pagination buttons
  */
  showPagination(){
    this.paginationElem.innerHTML = "";

    if(this.total <= this.limit){
      this.paginationElem.style.display = "none";
      return;
    }

    this.totalPages = Math.ceil(this.total/this.limit);

    this.previousPageButton();

    for(let i = 0; i < this.totalPages; i++){
      let numElem = document.createElement("li");
      let link = document.createElement("a");

      link.href = "#" ;
      link.innerHTML = '<span aria-hidden="true">' + (i + 1) + '</span><span class="sr-only"></span>';

      if(this.page === i + 1){
        numElem.className = "active";
        link.onclick = null;
      }else{
        link.onclick= (e) => {
          e.preventDefault();
          this.page = i + 1;
          this.createList(this.listContent);
        };
      }

      numElem.appendChild(link);
      this.paginationElem.appendChild(numElem);
    }
    this.nextPageButton();
  }
  /*
  * - Generates the previous button
  */
  previousPageButton(){
    let previousElem = document.createElement("li");
    let previousLink = document.createElement("a");

    previousLink.href = "#" ;
    previousLink.innerHTML = '<span aria-hidden="true">«</span><span class="sr-only">Previous</span></a>';

    if(this.start !== 0){
      previousElem.onclick = (e) => {
        e.preventDefault();
        this.page --;
        this.createList(this.listContent);
      };
    }else{
      previousElem.className = "disabled";
      previousElem.onclick = null;
    }

    previousElem.appendChild(previousLink);
    this.paginationElem.appendChild(previousElem);
  }
  /*
  * - Generates the Next page button
  */
  nextPageButton(){
    let nextElem = document.createElement("li");
    let nextLink = document.createElement("a");

    nextLink.href = "#" ;
    nextLink.innerHTML = '<a href="#" id="pagination_next">»<span class="sr-only">Next</span></a>';

    if(this.page < this.totalPages){
      nextElem.onclick = (e) => {
        e.preventDefault();
        this.page ++;
        this.createList(this.listContent);
      };
    }else{
      nextElem.className = "disabled";
      nextElem.onclick = null;
    }

    nextElem.appendChild(nextLink);
    this.paginationElem.appendChild(nextElem);
  }
  /*
  * - Forcing number that only has one decimal to 2 decimals, i.e. 1 to 01
  * @param number value- Needs to be integer value for that
  */
  padding(value){
      return ("0" + value).slice(-2);
  }
}
/*
* This class validates the value sent from the form, whether it is correct or not
*/
class ValidateLink{
  constructor(list){
    this.nameElem = document.getElementById("form_name");
    this.urlElem = document.getElementById("form_url");

    this.nameErrorElem = document.getElementById("name_error");
    this.urlErrorElem = document.getElementById("url_error");

    this.name = this.nameElem.value;
    this.url = this.urlElem.value;

    this.list = list;
  }
  /*
  * -Validate the fields from the form, and display the error on screen if they are incorrect
  */
  validate(){
    let valid = true;
    if(this.name.length === 0){
      this.nameErrorElem.innerHTML = "* Website name is required";
      valid = false;
    }

    if(this.url.length === 0){
      this.urlErrorElem.innerHTML = "* URL is required";
      valid = false;
    }

    if(!this.validateUrl()){
      this.urlErrorElem.innerHTML = "* URL format is invalid";
      valid = false;
    }

    return valid;
  }
  /*
  * -Validate the URL by regex
  */
  validateUrl(){
    let expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    return (this.url.match(regex))
  }

  /*
  * -Add the link to the List class, when the data are validated correctly
  */
  addLink(){
    this.list.addLink(this.name, this.url);
  }
}
