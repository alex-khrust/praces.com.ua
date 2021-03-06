var gulp = require('gulp'), // Подключаем Gulp
  sass = require('gulp-sass'), //Подключаем Sass пакет,
  browserSync = require('browser-sync'), // Подключаем Browser Sync
  concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
  uglify = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
  cssnano = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
  rename = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
  del = require('del'), // Подключаем библиотеку для удаления файлов и папок
  imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
  pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
  cache = require('gulp-cache'), // Подключаем библиотеку кеширования
  autoprefixer = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов
  notify = require('gulp-notify'), // Подключаем плагин оповещения при ошибке комприляции
  combiner = require('stream-combiner2').obj;

gulp.task('sass', function () { // Создаем таск Sass
  return combiner(
    gulp.src('src/sass/**/*.sass'),// Берем источник
    sass(), // Преобразуем Sass в CSS посредством gulp-sass
    autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}), // Создаем префиксы
    gulp.dest('src/css'), // Выгружаем результата в папку src/css
    browserSync.reload({stream: true}),
  ).on('error', notify.onError()); // Обновляем CSS на странице при изменении, и в случае ошибки выводим оповещение.
});

gulp.task('browser-sync', function () { // Создаем таск browser-sync
  browserSync({ // Выполняем browserSync
    server: { // Определяем параметры сервера
      baseDir: 'src' // Директория для сервера - src
    },
    notify: false // Отключаем уведомления
  });
});

gulp.task('scripts', function () {
  return gulp.src([ // Берем все необходимые библиотеки
    'src/libs/jquery/dist/jquery.min.js', // Берем jQuery
    // 'src/libs/fullpage.js/jquery.slimscroll.min.js',
    // 'src/libs/fullpage.js/jquery.fullPage.min.js',
    'src/libs/slick/slick.min.js',
    // 'src/libs/magnific-popup/dist/jquery.magnific-popup.min.js',
    // 'src/libs/wow/dist/wow.min.js'
  ])
    .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
    .pipe(uglify()) // Сжимаем JS файл
    .pipe(gulp.dest('src/js')); // Выгружаем в папку src/js
});

gulp.task('css-libs', ['sass'], function () {
  return gulp.src([ // Выбираем файл для минификации
    'src/libs/normalize.css/normalize.css',
    // 'src/libs/fullpage.js/dist/fullpage.min.css',
    // 'src/libs/magnific-popup/dist/magnific-popup.css',
    'src/libs/slick/slick.css',
    'src/libs/slick/slick-theme.css'
  ])
    .pipe(concat('libs.css'))
    .pipe(cssnano()) // Сжимаем
    .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
    .pipe(gulp.dest('src/css')); // Выгружаем в папку src/css
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function () {
  gulp.watch('src/sass/**/*.sass', ['sass']); // Наблюдение за sass файлами в папке sass
  gulp.watch('src/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
  gulp.watch('src/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function () {
  return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function () {
  return gulp.src('src/img/**/*') // Берем все изображения из src
    .pipe(cache(imagemin({ // С кешированием
      // .pipe(imagemin({ // Сжимаем изображения без кеширования
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))/**/)
    .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function () {
  
  var buildCss = gulp.src([ // Переносим библиотеки в продакшен
    'src/css/main.css',
    'src/css/libs.min.css'
  ])
    .pipe(gulp.dest('dist/css'));
  
  var buildFonts = gulp.src('src/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'));
  
  var buildJs = gulp.src('src/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('dist/js'));
  
  var buildHtml = gulp.src('src/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('dist'));
  
});

gulp.task('clear', function (callback) {
  return cache.clearAll();
});

gulp.task('default', ['watch']);
