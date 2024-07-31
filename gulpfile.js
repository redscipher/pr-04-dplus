// importacoes
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');
const uglify = require('gulp-uglify');
const clean = require('gulp-clean');
const pipeline = require('readable-stream').pipeline;

// funcoes ==> ambos ambientes
let comprimeImagens = function(){
    try {
        console.log('comprimindo imagens');
        // objeto
        let obj = gulp.src(['./imagens/**/*'])
                    .pipe(imagemin())
                    .pipe(gulp.dest('./build/imagens'));
        // def retorno
        return obj;
    } catch (error) {
        console.log(error.message);
    }
}

// dev
let compilaSASS = function(){
    try {
        console.log('compilando sass dev');
        // objeto
        let obj = gulp.src(['./src/estilos/sass/**/*.scss'])
                    .pipe(sourcemaps.init())
                    .pipe(sass())
                    .pipe(sourcemaps.write('./mapas'))
                    .pipe(gulp.dest('./build/dev/css'));
        // def retorno
        return obj;
    } catch (error) {
        console.log(error.message);
    }
}

let execSubstituicao = function() {
    try {
        console.log('substituindo dev');
        // executa substituicao de string
        return gulp.src(['./index.html'])
            .pipe(replace('ARQUIVO_CSS', './css/index.css'))
            .pipe(replace('ARQUIVO_JS', '../../src/js/index.js'))
            .pipe(gulp.dest('./build/dev'));
    } catch (error) {
            console.log(error.message);
    }
}

let executaTarefas = async function(){
    try {
        console.log('tarefas dev');
        // tarefas
        compilaSASS();
        // inicia tarefas em pararelo
        gulp.series(comprimeImagens(), execSubstituicao());
    } catch (error) {
        console.log(error.message);
    }
}

let executaWatch = function(){
    try {
        console.log('escutando dev');
        // inicia observacao dos arquivos
        gulp.watch(['./index.html', './src/**/*'], {ignoreInitial:false}, executaTarefas);
    } catch (error) {
        console.log(error.message);
    }
}

// producao
let compilaSASSDist = function(){
    try {
        console.log('compilando sass dist')
        // objeto
        let obj = gulp.src(['./src/estilos/sass/**/*.scss'])
                    .pipe(sourcemaps.init())
                    .pipe(sass({
                        outputStyle: 'compressed'
                    }))
                    .pipe(sourcemaps.write('./mapas'))
                    .pipe(gulp.dest('./build/dist/css'));
        // def retorno
        return obj;
    } catch (error) {
        console.log(error.message);
    }
}

let minificaHTML = function(){
    try {
        console.log('minificando html dist')
        // executa minificacao
        return gulp.src(['./index.html'])
            .pipe(htmlmin({
                collapseWhitespace: true,
                removeComments: true
            }))
            .pipe(gulp.dest('./prebuild'));
    } catch (error) {
        console.log(error.message);
    }
}

let execSubstituicaoDist = function() {
    try {
        console.log('substituindo dist');   
        // executa substituicao de string
        return gulp.src(['./prebuild/index.html'])
            .pipe(replace('ARQUIVO_CSS', './css/index.css'))
            .pipe(replace('ARQUIVO_JS', './js/index.js'))
            .pipe(gulp.dest('./build/dist'));
    } catch (error) {
            console.log(error.message);
    }
}

let minificaJS = function(){
    try {
        console.log('minificando js dist');
        // executa compressoes js
        return pipeline(gulp.src(['./src/js/*.js']),
                    uglify(),
                    gulp.dest('./build/dist/js')
                );
    } catch (error) {
        console.log(error.message);
    }
}

let deletaTemps = function(){
    try {
        console.log('deletando pastas');
        // deleta pastas
        return gulp.src(['./prebuild'])
            .pipe(clean({
                force: true
            }));
    } catch (error) {
        console.log(error.message);
    }
}

let executaTarefasDist = async function(){
    try {
        console.log('tarefas dist');
        // executa tarefas em serie
        minificaHTML()
        compilaSASSDist()
        // minificaJS();
        // inicia tarefas em paralelo
        gulp.parallel(comprimeImagens(), execSubstituicaoDist());
        // ----------
        deletaTemps();
    } catch (error) {
        console.log(error.message);
    }
}

// tarefas
gulp.task('default', gulp.parallel(executaTarefas));
gulp.task('watch', gulp.parallel(executaWatch));
// compila producao
gulp.task('compila_prod', gulp.parallel(executaTarefasDist));