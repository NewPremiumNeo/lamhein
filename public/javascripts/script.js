
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

setTimeout(() => {
  const notification__box = document.querySelector('.notification__box')
  if (notification__box) {
    notification__box.style.display = 'none';
  }
}, 5000);


//Loader

const loader = document.getElementById("mainLoader");

window.addEventListener("load", function (event) {
  event.preventDefault();
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    gsap.to(loader, { autoAlpha: 0, duration: 1 }).then(() => {
      loader.style.display = "none";
      document.body.style.overflow = '';
    });
  }, 1000);
});



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

    if (t.total <= 0) {
      if (daysSpan) {
        daysSpan.parentNode.style.display = 'none';
        clearInterval(timeinterval);
        forwardTimer(t.total);
      }
    } else {
      daysSpan.textContent = t.days;
      hoursSpan.textContent = ('0' + t.hours).slice(-2);
      minutesSpan.textContent = ('0' + t.minutes).slice(-2);
      secondsSpan.textContent = ('0' + t.seconds).slice(-2);
    }

  }

  updateClock();
  const timeinterval = setInterval(updateClock, 1000);
}

function forwardTimer(duration) {
  const timerText = document.getElementById('timerText');
  if (timerText) {
    timerText.innerText = "Performance started.";
    const interval = setInterval(function () {
      duration++;
      // Update the clock display
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      document.querySelector(".hours").textContent = ('0' + hours).slice(-2);
      document.querySelector(".minutes").textContent = ('0' + minutes).slice(-2);
      document.querySelector(".seconds").textContent = ('0' + seconds).slice(-2);

      // You can adjust this condition according to your needs
      if (duration > 1000) {
        clearInterval(interval);
        timerText.innerText = "Performance started.";
      }
    }, 1000);
  }
}

// End date of the countdown
const deadline = new Date(Date.parse(new Date("July 19,2024 17:00:00")));
const t = getTimeRemaining(deadline);
if (t.total <= 0) {
  if (document.querySelector(".days")) {
    document.querySelector(".days").parentNode.style.display = 'none';
  }
  forwardTimer(Math.abs(t.total) / 1000);
} else {
  initializeClock('clockdiv', deadline);
}


//Contact
function contact() {
  const scriptURL = 'https://script.google.com/macros/s/AKfycbxRO8RyeQa4Qk7Vqjlfe5BuU9OBOv7uKWzTjDyVERN4WlQvCYB_pBRuVX73DI6glzZG/exec'
  const form = document.forms['submit-to-google-sheet']
  const msg = document.getElementById('msg');
  form.addEventListener('submit', e => {
    e.preventDefault()
    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
      .then(response => {
        msg.style.display = 'block'
        msg.innerHTML = "Message Send Successfully"
        setTimeout(function () {
          msg.style.display = 'none'
          msg.innerHTML = ""
        }, 5000);
        form.reset();
      })
      .catch(error => console.error('Error!', error.message))
  })
}
contact()
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
    // markers:"true",
    scrub: 1,
  },
});
t1.from("#navbar h1, #navbar a", {
  y: -500,
  opacity: 0,
  stagger: 0.31
})

t1.from(".imp-heading h1,.btn", {
  x: -500,
  duration: 1,
  opacity: 0,
  stagger: 0.69
})

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


//Organisers section

function openDialog(role) {
  const members = {
    'technical': ['Prince', 'Ankit'],
    'management': ['Aaryan', 'Abhishek', 'Akshansh', 'Ankit', 'Divyanshu', 'Hariom', 'Jayantika', 'Muskan', 'Naina', 'Pavan', 'Prince', 'Raj', 'Rajeev', 'Rishab', 'Riteek', 'Adarsh', 'Aarya', 'Rohit', 'Saurav', 'Vishal'],
    'catering': ['Adarsh', 'Raj', 'Rajeev', 'Saurav', 'Hariom'],
    'stage': ['Naina', 'Jayantika', 'Arya', 'Akshansh', 'Rishabh'],
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
  dialog.style.overflow = 'auto';
  document.body.style.overflowY = "hidden";
}

function closeDialog() {
  // Hide the dialog
  const dialog = document.getElementById('dialog');
  dialog.style.display = 'none';
  document.body.style.overflowY = "auto";
}


function showAlert() {
  var choice = confirm('Please Login First');
  if (choice == true) {
    window.location.href = '/login';
  }
}

function profileAsWidthChanges() {
  var width = window.innerWidth;
  if (width > 768) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(".profile1", {
      scrollTrigger: {
        trigger: ".profile1",
        start: "top 50%", // Start scrolling from the left edge of .profile
        end: "bottom 65%", // End scrolling at the right edge of .profile
        scrub: 1,
        // markers:"true"
      },
      x: -(document.querySelector('.person1').scrollWidth - document.querySelector('.person1').offsetWidth) // Scrolls the .profile horizontally
    });

    gsap.to(".profile2", {
      scrollTrigger: {
        trigger: ".profile2",
        start: "top 60%", // Start scrolling from the left edge of .profile
        end: "bottom 60%", // End scrolling at the right edge of .profile
        scrub: 1,
        // markers:"true"
      },
      x: -(document.querySelector('.person2').scrollWidth - document.querySelector('.person2').offsetWidth) // Scrolls the .profile horizontally
    });
    gsap.to(".profile3", {
      scrollTrigger: {
        trigger: ".profile3",
        start: "top 50%", // Start scrolling from the left edge of .profile
        end: "bottom 60%", // End scrolling at the right edge of .profile
        scrub: 1,
        // markers:"true"
      },
      x: -(document.querySelector('.person3').scrollWidth - document.querySelector('.person3').offsetWidth) // Scrolls the .profile horizontally
    });
  }
}

profileAsWidthChanges()