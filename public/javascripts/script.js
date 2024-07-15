
//Color Pallete Selection on the basis of user's mode
function detectColorScheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

// to detect changes in user's mode
window.matchMedia('(prefers-color-scheme: dark)').addListener(detectColorScheme);

// first detection of mode
detectColorScheme();



// CountDown Timer
function getTimeRemaining(endtime) {
  const total = Date.parse(endtime) - Date.parse(new Date());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds
  };
}

function initializeClock(id, endtime) {
  const clock = document.getElementById(id);
  if (!clock) return;
  const daysSpan = clock.querySelector('.days');
  const hoursSpan = clock.querySelector('.hours');
  const minutesSpan = clock.querySelector('.minutes');
  const secondsSpan = clock.querySelector('.seconds');

  function updateClock() {
    const t = getTimeRemaining(endtime);

    daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

    if (t.total <= 0) {
      clearInterval(timeinterval);
    }
  }

  updateClock();
  const timeinterval = setInterval(updateClock, 1000);
}
// End date of the countdown
const deadline = new Date(Date.parse(new Date("July 20,2024 00:00:00")));
initializeClock('clockdiv', deadline);

//scroll triggers on nav and main section
var t1 = gsap.timeline()
gsap.to("#navbar", {
  backgroundColor: "#000",
  duration: 0.5,
  height: "70px",
  scrollTrigger: {
    trigger: "#navbar",
    scroller: "body",
    // markers:true,
    start: "top -1vh",
    end: "top -1.1vh",
    scrub: 1,
  },
});
t1.from("#navbar h1, #navbar a", {
  y: -100,
  opacity: 0,
  stagger: 0.2
})

t1.from(".imp-heading h1,.btn", {
  x: -500,
  duration: 1,
  opacity: 0
})

gsap.from(".profile", {
  x: 50,
  opacity: 0,
  duration: 1,
  stagger: 0.4,
  scrollTrigger: {
    trigger: ".profile",
    scroller: "body",
    scrub: 1,
  },
});

function hamwork() {
  const hambox = document.querySelector(".ham-box");
  const hambarbox = document.querySelector(".ham-bar-box");
  const hambarboxa = document.querySelectorAll(".ham-bar-box-contant a");

  let hamopen = false;
  hambox.addEventListener("click", function () {
    if (!hamopen) {
      hambox.classList.add("open");
      hamopen = true;
      gsap.to(hambarbox, {
        duration: 0.01,
        opacity: 1,
        scale: 1,
      });
      document.body.style.overflow = 'hidden';
    } else {
      hambox.classList.remove("open");
      hamopen = false;
      gsap.to(hambarbox, {
        duration: 0.2,
        opacity: 0,
        scale: 0,
      });
      document.body.style.overflow = '';

    }
  });

  hambarboxa.forEach(function (elem) {
    elem.addEventListener("click", function () {
      if (!hamopen) {
        hambox.classList.add("open");
        hamopen = true;
        gsap.to(hambarbox, {
          duration: 0.2,
          opacity: 1,
          scale: 1,
        });
        document.body.style.overflow = 'hidden';
      }
      else {
        hambox.classList.remove("open");
        hamopen = false;
        gsap.to(hambarbox, {
          duration: 0.2,
          opacity: 0,
          scale: 0,
        });
        document.body.style.overflow = '';

      }
    });
  });
}
hamwork();

function hambarboxHeight() {
  const navHeight = document.querySelector("#navbar").offsetHeight;
  document.documentElement.style.setProperty('--scroll-padding', navHeight + 'px');
}
hambarboxHeight();

//Loader

const loader = document.getElementById("mainLoader");
const body = document.querySelector("body");

window.addEventListener("load", function (event) {
  event.preventDefault();

  setTimeout(() => {
    gsap.to(loader, { autoAlpha: 0, duration: 1 }).then(() => {
      loader.style.display = "none";
    });
  }, 1000);
});



//Organisers section

function openDialog(role) {
  const members = {
    'technical': ['Prince Kumar', 'Ankit Raj'],
    'management': ['Aaryan', 'Abhishek', 'Akshansh', 'Ankit', 'Divyanshu', 'Hariom', 'Jayantika', 'Muskan', 'Naina', 'Pavan', 'Prince', 'Raj', 'Rajeev', 'Rishab', 'Riteek', 'Adarsh', 'Aarya', 'Rohit', 'Saurav', 'Vishal'],
    'catering': ['Adarsh', 'Raj', 'Rajeev', 'Saurav', 'Hariom'],
    'stage': ['Naina', 'Jayantika', 'Arya', 'Akshansh', 'Rishab'],
    'backstage': ['Ankit'],
    'finance': ['Abhishek'],
    'performance': ['Abhishek', 'Raj', 'Muskan', 'Divyanshu'],
    'decoration': ['Riteek', 'Aaryan', 'Naina', 'Rohit']
    // Add more roles and members as needed
  };

  const memberList = members[role];
  const dialogMemberList = document.getElementById('dialogMemberList');

  // Clear previous member list if any
  dialogMemberList.innerHTML = '';

  // Populate the dialog with members
  memberList.forEach(member => {
    const listItem = document.createElement('li');
    listItem.textContent = member;
    dialogMemberList.appendChild(listItem);
    listItem.style.color = '#000';
  });

  // Display the dialog
  const dialog = document.getElementById('dialog');
  dialog.style.display = 'block';
  document.body.style.overflowY = "hidden";
}

function closeDialog() {
  // Hide the dialog
  const dialog = document.getElementById('dialog');
  dialog.style.display = 'none';
  document.body.style.overflowY = "auto";
}


function toggleLoginLogout() {
  var loginLogoutLink = document.getElementById("loginLogoutLink");
  var isLoggedIn = true; // Replace this with your actual authentication logic

  if (isLoggedIn) {
    loginLogoutLink.textContent = "Log out";
    loginLogoutLink.href = "/logout"; // Replace "/logout" with your logout URL
  } else {
    loginLogoutLink.textContent = "Log in";
    loginLogoutLink.href = "/login"; // Replace "/login" with your login URL
  }
}

// Call the function when the page loads
window.onload = toggleLoginLogout;


function showAlert() {
  var choice = confirm('Please Login First');
  if (choice == true) {
    window.location.href = '/login';
  }
}