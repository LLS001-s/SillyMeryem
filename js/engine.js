// =====================================
// Birthday Movie Engine V5
// Linsen & ChatGPT
// =====================================


// =====================================
// 获取页面元素
// =====================================

const startBtn = document.getElementById("startBtn");

const cover = document.getElementById("cover");

const memory = document.getElementById("memory");

const container = document.getElementById("slideContainer");

const bgm = document.getElementById("bgm");

const pageNumber = document.getElementById("pageNumber");

const movieQuote = document.getElementById("movieQuote");

const prevBtn = document.getElementById("prevBtn");

const nextBtn = document.getElementById("nextBtn");

const movieToast =
    document.getElementById("movieToast");

const navButtons =
    document.getElementById("navButtons");


// =====================================
// 背景视频
// =====================================

const bgVideo1 =
    document.getElementById("bgVideo1");

const bgVideo2 =
    document.getElementById("bgVideo2");

const bgVideo3 =
    document.getElementById("bgVideo3");

const fireVideo =
    document.getElementById("fireVideo");


// 所有背景视频
const backgroundVideos = [

  bgVideo1,

  bgVideo2,

  bgVideo3,

  fireVideo

];


// =====================================
// 全局变量
// =====================================

let endingClick = 0;

let currentIndex = 0;

let chatFinished = true;

let toastTimer = null;

let typing = false;

let typingTimer = null;

let currentText = "";

let currentTextElement = null;

let chapterTimer = null;

let pageVersion = 0;

let chatTimers = [];

let hideTimer;


// 图片缓存
const imageCache = new Set();


// =====================================
// 聊天定时器
// =====================================

function clearChatTimers() {

  chatTimers.forEach(timer => {

    clearTimeout(timer);

  });

  chatTimers = [];

}


function scheduleChat(callback, delay) {

  const timer = setTimeout(() => {

    chatTimers =
        chatTimers.filter(item => item !== timer);

    callback();

  }, delay);

  chatTimers.push(timer);

  return timer;

}


// =====================================
// 三首背景音乐
//
// bgm1 → bgm2 → bgm3
//         ↓
//       bgm1
//         ↓
//       bgm2
//         ↓
//       bgm3
//         ↓
//       无限循环
// =====================================

const musicPlaylist = [

  "music/bgm1.mp3",

  "music/bgm2.mp3",

  "music/bgm3.mp3"

];


// 当前音乐
let currentMusicIndex = 0;


// =====================================
// 播放音乐
// =====================================

function playMusic(index) {

  if (!musicPlaylist.length) {

    return;

  }


  currentMusicIndex =
      index % musicPlaylist.length;


  bgm.src =
      musicPlaylist[currentMusicIndex];


  // 关闭 HTML 自带循环
  // 我们自己控制下一首
  bgm.loop = false;


  bgm.currentTime = 0;


  const playPromise =
      bgm.play();


  if (
      playPromise &&
      typeof playPromise.catch === "function"
  ) {

    playPromise.catch(error => {

      console.warn(
          "音乐播放失败:",
          error
      );

    });

  }

}


// =====================================
// 当前歌曲播放完毕
// 自动播放下一首
// =====================================

bgm.addEventListener("ended", function () {

  currentMusicIndex =
      (currentMusicIndex + 1)
      % musicPlaylist.length;


  playMusic(currentMusicIndex);

});


// =====================================
// Start
// =====================================

startBtn.onclick = function (e) {

  // 防止按钮点击继续触发页面翻页
  e.stopPropagation();


  endingClick = 0;


  cover.style.display = "none";


  memory.classList.remove("hidden");


  // 从第一张页面开始
  currentIndex = 0;


  // 从第一首音乐开始
  currentMusicIndex = 0;


  playMusic(currentMusicIndex);


  // 根据第一个章节设置背景
  setBackgroundForCurrentChapter();


  // 预加载图片
  preloadImages();


  // 渲染页面
  render();


  // 显示导航
  showNavigation();

};


// =====================================
// 获取当前章节编号
//
// memories 中每出现一个
// type === "chapter"
// 就代表进入下一章节
// =====================================

function getCurrentChapterNumber() {

  let chapterNumber = 0;


  for (
      let i = 0;
      i <= currentIndex;
      i++
  ) {

    if (
        memories[i] &&
        memories[i].type === "chapter"
    ) {

      chapterNumber++;

    }

  }


  return chapterNumber;

}


// =====================================
// 切换背景视频
// =====================================

function switchBackground(activeVideo) {

  backgroundVideos.forEach(video => {

    if (!video) {

      return;

    }


    if (video === activeVideo) {

      // 显示当前背景
      video.style.opacity = "1";


      // 确保视频继续播放
      const promise =
          video.play();


      if (
          promise &&
          typeof promise.catch === "function"
      ) {

        promise.catch(() => {});

      }

    } else {

      // 隐藏其他背景
      video.style.opacity = "0";


      // 暂停其他背景
      video.pause();

    }

  });

}


// =====================================
// 根据当前章节选择背景
//
// 第 1 - 10 章
//     meteor.mp4
//
// 第 11 - 12 章
//     background2.mp4
//
// 第 13 - 29 章
//     background3.mp4
//
// 第 30 章
//     fireworks.mp4
// =====================================

function setBackgroundForCurrentChapter() {

  const chapterNumber =
      getCurrentChapterNumber();


  // =================================
  // 最后一章
  // 烟花背景
  // =================================

  if (chapterNumber >= 30) {

    switchBackground(fireVideo);

    return;

  }


  // =================================
  // 第 1 - 10 章
  // =================================

  if (chapterNumber <= 10) {

    switchBackground(bgVideo1);

    return;

  }


  // =================================
  // 第 11 - 20 章
  // =================================

  if (chapterNumber <= 20) {

    switchBackground(bgVideo2);

    return;

  }


  // =================================
  // 第 21 - 29 章
  // =================================

  switchBackground(bgVideo3);

}


// =====================================
// 下一页按钮
// =====================================

nextBtn.onclick = function (e) {

  e.stopPropagation();


  showNavigation();


  nextPage();

};


// =====================================
// 上一页按钮
// =====================================

prevBtn.onclick = function (e) {

  e.stopPropagation();


  showNavigation();


  previousPage();

};


// =====================================
// 上一页
// =====================================

function previousPage() {

  if (currentIndex === 0) {

    return;

  }


  currentIndex--;


  render();

}


// =====================================
// 显示导航
// =====================================

function showNavigation() {

  navButtons.classList.add("show");


  clearTimeout(hideTimer);


  hideTimer = setTimeout(() => {

    navButtons.classList.remove("show");

  }, 3000);

}


// =====================================
// 图片预加载
// =====================================

function preloadAround(index) {

  const indexes = [

    index - 1,

    index + 1,

    index + 2

  ];


  indexes.forEach(i => {

    if (
        i < 0 ||
        i >= memories.length
    ) {

      return;

    }


    const item = memories[i];


    // 单张图片
    if (
        item.type === "image" &&
        item.image
    ) {

      if (
          imageCache.has(item.image)
      ) {

        return;

      }


      const img = new Image();


      img.src = item.image;


      imageCache.add(item.image);

    }


    // Gallery
    if (
        item.type === "gallery" &&
        Array.isArray(item.images)
    ) {

      item.images.forEach(src => {

        if (
            imageCache.has(src)
        ) {

          return;

        }


        const img = new Image();


        img.src = src;


        imageCache.add(src);

      });

    }

  });

}


// =====================================
// 渲染当前页面
// =====================================

function render() {

  pageVersion++;


  clearTimeout(chapterTimer);


  clearChatTimers();


  const item =
      memories[currentIndex];


  preloadAround(currentIndex);


  // =================================
  // 每次翻页都重新判断章节背景
  // =================================

  setBackgroundForCurrentChapter();


  if (!item) {

    console.error(
        "未找到当前页面数据:",
        currentIndex
    );

    return;

  }


  // 聊天页面隐藏导航
  if (item.type === "chat") {

    navButtons.style.display = "none";

  } else {

    navButtons.style.display = "flex";

  }


  // 清空旧页面
  container.innerHTML = "";


  typing = false;


  clearTimeout(typingTimer);


  currentText = "";


  currentTextElement = null;


  movieQuote.innerHTML = "";


  // 页码
  pageNumber.innerHTML =
      (currentIndex + 1)
      + " / "
      + memories.length;


  // =================================
  // 根据页面类型渲染
  // =================================

  switch (item.type) {

    case "chapter":

      renderChapter(item);

      break;


    case "image":

      renderImage(item);

      break;


    case "gallery":

      renderGallery(item);

      break;


    case "text":

      renderText(item);

      break;


    case "chat":

      renderChat(item);

      break;


    case "video":

      renderVideo(item);

      break;


    case "ending":

      renderEnding(item);

      break;


    case "cinematic":

      renderCinematic(item);

      break;


    default:

      console.log(
          "Unknown page type:",
          item.type
      );

  }

}


// =====================================
// 下一页
// =====================================

function nextPage() {

  // 已经最后一页
  if (
      currentIndex >=
      memories.length - 1
  ) {

    endingClick++;


    if (endingClick === 1) {

      showMovieToast(

          "Silly Meryem～ ～ ❤️<br><br>" +
          "It's goneeeeeee, don't click againnnnnn～ 😂"

      );

    }

    else if (endingClick === 2) {

      showMovieToast(

          "Sillyyyyy!!!! 😆<br><br>" +
          "I already told you it's over!! 😤"

      );

    }

    else if (endingClick === 3) {

      showMovieToast(

          "If you still want to see it ❤️<br><br>" +
          "hehehehehehe, don't leave me。<br><br>" +
          "I'll do it next year.❤️"

      );

    }

    else {

      showMovieToast(

          "Okieeeeeee，Byeeeeeeebyeeeeee～ 😂<br><br>" +
          "Go find me on Wechat~ 😆❤️"

      );

    }


    return;

  }


  currentIndex++;


  render();

}


// =====================================
// 点击屏幕翻页
// =====================================

document.addEventListener(
    "click",
    function (e) {

      // 首页不处理
      if (
          memory.classList.contains("hidden")
      ) {

        return;

      }


      // 正在打字
      if (typing) {

        finishTyping();

        return;

      }


      // 聊天还没结束
      if (
          memories[currentIndex].type === "chat" &&
          !chatFinished
      ) {

        showToast(

            "Take your time, sillyyyy Meryem, " +
            "don't click next till you've read everything properly!😁😁😁❤️"

        );

        return;

      }


      nextPage();

    }
);


// =====================================
// Chapter
// =====================================

function renderChapter(item) {

  chatFinished = false;


  const slide =
      document.createElement("div");


  slide.className =
      "slide chapter-slide";


  slide.innerHTML = `

        <h2>${item.title}</h2>

        <h1>${item.subtitle}</h1>

        ${
      item.text
          ? `<p class="story-text">${item.text}</p>`
          : ""
  }

    `;


  container.appendChild(slide);


  // 背景由 render()
  // 根据章节自动控制


}


// =====================================
// Image
// =====================================

function renderImage(item) {

  const slide =
      document.createElement("div");


  slide.className =
      "slide";


  // =================================
  // 左右布局
  // =================================

  const layout =
      document.createElement("div");


  layout.className =
      "movie-layout";


  // =================================
  // 左边图片
  // =================================

  const left =
      document.createElement("div");


  left.className =
      "movie-image";


  const img =
      document.createElement("img");


  img.src =
      item.image;


  img.alt =
      item.title || "";


  if (item.fit) {

    img.style.objectFit =
        item.fit;

  }


  left.appendChild(img);


  // =================================
  // 右边文字
  // =================================

  const right =
      document.createElement("div");


  right.className =
      "movie-text";


  if (item.title) {

    const h2 =
        document.createElement("h2");


    h2.innerText =
        item.title;


    right.appendChild(h2);

  }


  const p =
      document.createElement("p");


  p.className =
      "story-text auto-text";


  right.appendChild(p);


  typeWriter(
      p,
      item.text || ""
  );


  // 电影台词
  if (item.quote) {

    movieQuote.innerText =
        item.quote;

  }


  // =================================
  // 合并
  // =================================

  layout.appendChild(left);


  layout.appendChild(right);


  slide.appendChild(layout);


  container.appendChild(slide);

}


// =====================================
// Gallery
// =====================================

function renderGallery(item) {

  const slide =
      document.createElement("div");


  slide.className =
      "slide";


  // 左右布局
  const layout =
      document.createElement("div");


  layout.className =
      "movie-layout";


  // =================================
  // 左边图片区域
  // =================================

  const left =
      document.createElement("div");


  left.className =
      "movie-image";


  const gallery =
      document.createElement("div");


  gallery.className =
      "gallery";


  // =================================
  // 自动 Gallery 布局
  // =================================

  if (
      item.images.length === 3
  ) {

    gallery.classList.add(
        "gallery-3"
    );

  }

  else if (
      item.images.length === 4
  ) {

    gallery.classList.add(
        "gallery-4"
    );

  }

  else if (
      item.images.length >= 5
  ) {

    gallery.classList.add(
        "gallery-many"
    );

  }


  item.images.forEach(src => {

    const img =
        document.createElement("img");


    img.src =
        src;


    gallery.appendChild(img);

  });


  left.appendChild(gallery);


  // =================================
  // 右边文字区域
  // =================================

  const right =
      document.createElement("div");


  right.className =
      "movie-text";


  if (item.title) {

    const h2 =
        document.createElement("h2");


    h2.innerText =
        item.title;


    right.appendChild(h2);

  }


  const p =
      document.createElement("p");


  p.className =
      "story-text auto-text";


  right.appendChild(p);


  typeWriter(
      p,
      item.text || ""
  );


  if (item.quote) {

    movieQuote.innerText =
        item.quote;

  }


  // =================================
  // 合成页面
  // =================================

  layout.appendChild(left);


  layout.appendChild(right);


  slide.appendChild(layout);


  container.appendChild(slide);

}


// =====================================
// Text
// =====================================

function renderText(item) {

  const slide =
      document.createElement("div");


  slide.className =
      "slide text-slide";


  const box =
      document.createElement("div");


  box.className =
      "text-box";


  // 标题
  if (item.title) {

    const h2 =
        document.createElement("h2");


    h2.innerText =
        item.title;


    box.appendChild(h2);

  }


  // 副标题
  if (item.subtitle) {

    const h3 =
        document.createElement("h3");


    h3.className =
        "text-subtitle";


    h3.innerText =
        item.subtitle;


    box.appendChild(h3);

  }


  // 正文
  const p =
      document.createElement("p");


  p.className =
      "story-text auto-text";


  box.appendChild(p);


  typeWriter(
      p,
      item.text || ""
  );


  slide.appendChild(box);


  container.appendChild(slide);


  // 电影字幕
  movieQuote.innerText =
      item.quote || "";

}


// =====================================
// 打字机
// =====================================

function typeWriter(
    element,
    text,
    speed = 22
) {

  typing = true;


  currentText =
      text;


  currentTextElement =
      element;


  element.innerHTML =
      "";


  let i = 0;


  function write() {

    if (i < text.length) {

      element.innerHTML +=
          text.charAt(i);


      i++;


      typingTimer =
          setTimeout(
              write,
              speed
          );

    }

    else {

      typing = false;

    }

  }


  write();

}


// =====================================
// 点击立即显示全部文字
// =====================================

function finishTyping() {

  clearTimeout(
      typingTimer
  );


  if (currentTextElement) {

    currentTextElement.innerHTML =
        currentText;

  }


  typing = false;

}


// =====================================
// Chat Engine
// =====================================

function renderChat(item) {

  const slide =
      document.createElement("div");


  slide.className =
      "slide";


  slide.innerHTML = `

        <div class="chat-window">

            <div class="chat-header">

                <img
                    class="avatar"
                    src="${item.avatar}"
                >

                <div>

                    <h3>
                        ${item.name}
                    </h3>

                    <span class="online">
                        ${item.status || "Online"}
                    </span>

                </div>

            </div>


            <div id="chatArea"></div>

        </div>

    `;


  container.appendChild(slide);


  playMessages(
      item.messages
  );

}


// =====================================
// 播放聊天
// =====================================

function playMessages(messages) {

  const area =
      document.getElementById(
          "chatArea"
      );


  const activePageVersion =
      pageVersion;


  let index = 0;


  function isActive() {

    return (
        activePageVersion === pageVersion &&
        area &&
        area.isConnected
    );

  }


  function sendNext() {

    if (!isActive()) {

      return;

    }


    if (
        index >= messages.length
    ) {

      chatFinished = true;

      return;

    }


    const msg =
        messages[index];


    // =================================
    // typing...
    // =================================

    const typingElement =
        document.createElement(
            "div"
        );


    typingElement.className =
        msg.from === "me"
            ? "typing me"
            : "typing them";


    typingElement.innerHTML = `

            <span></span>

            <span></span>

            <span></span>

        `;


    area.appendChild(
        typingElement
    );


    area.scrollTop =
        area.scrollHeight;


    scheduleChat(() => {

      if (!isActive()) {

        return;

      }


      typingElement.remove();


      const bubble =
          document.createElement(
              "div"
          );


      bubble.className =
          msg.from === "me"
              ? "bubble me"
              : "bubble them";


      // =================================
      // 图片 / Sticker
      // =================================

      if (msg.image) {

        const img =
            document.createElement(
                "img"
            );


        img.src =
            msg.image;


        img.className =
            "sticker";


        bubble.appendChild(
            img
        );


        area.appendChild(
            bubble
        );


        area.scrollTo({

          top:
          area.scrollHeight,

          behavior:
              "smooth"

        });


        index++;


        scheduleChat(
            sendNext,
            700
        );

      }

          // =================================
          // 文字消息
      // =================================

      else {

        area.appendChild(
            bubble
        );


        typeBubble(

            bubble,

            msg.text,

            () => {

              if (
                  !isActive()
              ) {

                return;

              }


              index++;


              scheduleChat(
                  sendNext,
                  700
              );

            }

        );

      }


      area.scrollTop =
          area.scrollHeight;


    }, 900);

  }


  sendNext();

}


// =====================================
// 聊天文字打字动画
// =====================================

function typeBubble(
    box,
    text,
    finish
) {

  let i = 0;


  function typing() {

    if (i < text.length) {

      box.innerHTML +=
          text.charAt(i);


      i++;


      setTimeout(
          typing,
          60
      );

    }

    else {

      finish();

    }

  }


  typing();

}


// =====================================
// Cinematic
// =====================================

function renderCinematic(item) {

  const slide =
      document.createElement(
          "div"
      );


  slide.className =
      "slide cinematic";


  const box =
      document.createElement(
          "div"
      );


  box.className =
      "cinematic-box";


  slide.appendChild(
      box
  );


  container.appendChild(
      slide
  );


  let i = 0;


  function showLine() {

    if (
        i >= item.lines.length
    ) {

      return;

    }


    const p =
        document.createElement(
            "p"
        );


    p.className =
        "cinematic-line";


    p.innerText =
        item.lines[i];


    box.appendChild(
        p
    );


    i++;


    setTimeout(
        showLine,
        1800
    );

  }


  showLine();


  if (item.quote) {

    movieQuote.innerText =
        item.quote;

  }

}


// =====================================
// Video
// =====================================

function renderVideo(item) {

  const slide =
      document.createElement(
          "div"
      );


  slide.className =
      "slide";


  const video =
      document.createElement(
          "video"
      );


  video.controls = true;


  video.playsInline = true;


  video.src =
      item.video;


  slide.appendChild(
      video
  );


  container.appendChild(
      slide
  );


  if (item.title) {

    movieQuote.innerText =
        item.title;

  }

}


// =====================================
// Ending
// =====================================

function renderEnding(item) {

  const slide =
      document.createElement(
          "div"
      );


  slide.className =
      "slide ending";


  slide.innerHTML = `

        <h1>
            ${item.title || ""}
        </h1>

        <p>
            ${item.text || ""}
        </p>

        <div class="heart">
            ❤️
        </div>

    `;


  container.appendChild(
      slide
  );

}


// =====================================
// 重置背景
//
// 如果其他代码调用这个函数，
// 默认回到第一段流星背景。
// 正常翻页时不会使用它，
// render() 会自动按照章节选择背景。
// =====================================

function resetBackground() {

  switchBackground(
      bgVideo1
  );


  const stars =
      document.getElementById(
          "stars"
      );


  if (stars) {

    stars.style.opacity =
        .08;

  }

}


// =====================================
// 最后一页 Toast
// =====================================

function showMovieToast(text) {

  movieToast.innerHTML =
      text;


  movieToast.classList.add(
      "show"
  );


  clearTimeout(
      movieToast.timer
  );


  movieToast.timer =
      setTimeout(() => {

        movieToast.classList.remove(
            "show"
        );

      }, 2600);

}


// =====================================
// 预加载所有图片
// =====================================

function preloadImages() {

  memories.forEach(item => {

    // 单张图片
    if (
        item.type === "image" &&
        item.image
    ) {

      const img =
          new Image();


      img.src =
          item.image;

    }


    // Gallery
    if (
        item.type === "gallery" &&
        Array.isArray(item.images)
    ) {

      item.images.forEach(src => {

        const img =
            new Image();


        img.src =
            src;

      });

    }

  });

}


// =====================================
// 普通 Toast
// =====================================

function showToast(text) {

  clearTimeout(
      toastTimer
  );


  let toast =
      document.getElementById(
          "toast"
      );


  if (!toast) {

    toast =
        document.createElement(
            "div"
        );


    toast.id =
        "toast";


    document.body.appendChild(
        toast
    );

  }


  toast.innerText =
      text;


  toast.classList.add(
      "show"
  );


  toastTimer =
      setTimeout(() => {

        toast.classList.remove(
            "show"
        );

      }, 2000);

}