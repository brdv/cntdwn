function init(){
  console.log('initializing cntdwn...');
  const object = getCntdwnObject();

  window.addEventListener('resize', () => {
    visualizeCntdwnObject(object);
  })

  visualizeCntdwnObject(object);
}

function getCntdwnObject() {
  const params = new URLSearchParams(window.location.search);
  const state = params.get('state');
  if (state) {
    console.log('cntdwnObject', JSON.parse(atob(state)));
    const cntdwnObject = cntdwnObjectFromState(state);
    if (cntdwnObject) {
      return cntdwnObject;
    }
  } else {
    return {
      title: 'Days left this year',
      total: 365,
      complete: Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0)) /
          (1000 * 60 * 60 * 24)
      ),
    };
  }
}

function getBaseUrl() {
  const url = window.location.href;
  const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
  return baseUrl;
}

function isCompleteInput(object){
  return object.title && object.endDate
}

function calculateTotalDays(object) {
  const startDate = new Date(object.startDate || Date.now());
  const endDate = new Date(object.endDate);
  const totalIncludingStartdate = Math.ceil(endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
  return totalIncludingStartdate;
}

function calculateCompleteDays(startDate) {
  const complete = Math.ceil((Date.now() - startDate) / (1000 * 60 * 60 * 24));
  return complete;
}

function cntdwnObjectFromState(state){
  let object = JSON.parse(atob(state))
  if (isCompleteInput(object)) {
    const total = calculateTotalDays(object)
    const complete = calculateCompleteDays(new Date(object.startDate || Date.now()))

    return {
      title: object.title,
      complete,
      total,
    }
  }

  return null;
}

function toggleDialog() {
  const dialog = document.querySelector('#infodialog');
  dialog.open = !dialog.open;
}

function visualizeCntdwnObject(object) {
  document.querySelector('#title').innerText = object.title;
  document.querySelector('.container').innerHTML = '';
  const containerDiv = document.querySelector('.container');
  const numCircles = object.total;
  const complete = object.complete;

  // get heigth and with of containerDiv
  const containerDivWidth = containerDiv.clientWidth;
  const containerDivHeight = containerDiv.clientHeight;
  const aspectRatio = containerDivHeight / containerDivWidth;

  let rows, columns;

  // calculate rows and columns based on aspect ratio
  if (aspectRatio < 1) {
    columns = Math.ceil(Math.sqrt(numCircles / aspectRatio));
    rows = Math.ceil(numCircles / columns);
  } else {
    rows = Math.ceil(Math.sqrt(numCircles * aspectRatio));
    columns = Math.ceil(numCircles / rows);
  }

  const maxSize = Math.floor(
    Math.min(containerDivWidth / columns, containerDivHeight / rows)
  );
  const margin = Math.floor((maxSize - 4) * 0.01);

  for (let i = 0; i < numCircles; i++) {
    const circle = document.createElement('div');
    circle.className = 'circle';

    circle.style.width = `${maxSize - 4 - margin - margin}px`;
    circle.style.height = `${maxSize - 4 - margin - margin}px`;
    circle.style.margin = `${margin}px`;
    
    if (i < complete) {
      circle.className = 'circle complete-circle';
    } else {
      circle.className = 'circle incomplete-circle';
    }

    containerDiv.appendChild(circle);
  }
}

function handleForm(form) {
  const dialog = document.querySelector('#infodialog');
  const title = form.title.value;
  const startDate = form.startDate.value;
  const endDate = form.endDate.value;

  const total = Math.floor(
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );

  if (title === '' || total === '') {
    dialog.open = false;

    return;
  }

  dialog.open = false;

  const encodedObject = btoa(
    JSON.stringify({
      title,
      startDate,
      endDate,
    })
  );

  window.location.href = `${getBaseUrl()}?state=${encodedObject}`;
}