module.exports = function(grunt) {

    var currentDate = new Date(),
        currentMonth = currentDate.getMonth() + 1,
        currentMonth = ("0" + currentMonth).slice(-2),
        currentDay = ("0" + currentDate.getDate()).slice(-2),
        currentHour = ("0" + currentDate.getHours()).slice(-2),
        currentMinutes = ("0" + currentDate.getMinutes()).slice(-2),
        buildTimestamp = "" + currentDate.getFullYear() + currentMonth + currentDay + currentHour + currentMinutes,
        buildNumber = process.env.BUILD_NUMBER

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            target: ["www/**/*"],
            version: ["www/js/version.js"]
        },
        concat: {
            js: {
                src: ['www_src/js/**/*.js','www/js/version.js'],
                dest: 'www/js/crowd.js'
            },
            interface: {
                src: ['www_src/interface/**/*.js'],
                dest: 'www/js/interface.js'
            },
            css: {
                src: ['www_src/style/css/*.css'],
                dest: 'www/css/crowd.css'
            },
            libjs: {
                src: ['www_src/lib/angular/angular-1.5.7.js',
                    'www_src/lib/onsen/js/onsenui.js',
                    'www_src/lib/onsen/js/angular-onsenui.js',
                    'www_src/lib/angular/angular-resource.min.js',
                    'www_src/lib/angular/ng-cordova.js',
                    'www_src/lib/angular/ready.js',
                    'www_src/lib/angular/filesystem.js',
                    'www_src/lib/angular/connection.js',
                    'www_src/lib/angular/geolocation.js',
                    'www_src/lib/backendless/backendless.min.js'
                ],
                dest: 'www/js/lib.js'
            }
        },
        copy: {
            main: {
                files: [{
                    cwd: 'www_src/templates',
                    src: '**/*',
                    dest: 'www/templates',
                    expand: true
                }, {
                    cwd: 'www_src',
                    src: ['index.html', 'main.html'],
                    dest: 'www',
                    expand: true
                }, {
                    cwd: 'www_src/res',
                    src: '**/*',
                    dest: 'www/res',
                    expand: true
                }, {
                    cwd: 'www_src/lang',
                    src: '**/*',
                    dest: 'www/lang',
                    expand: true
                }, {
                    cwd: 'www_src/img',
                    src: '**/*',
                    dest: 'www/img',
                    expand: true
                }, {
                    cwd: 'www_src/lib/onsen/css/ionicons',
                    src: '**',
                    dest: 'www/css/ionicons',
                    expand: true
                }, {
                    cwd: 'www_src/lib/onsen/css/font_awesome',
                    src: '**',
                    dest: 'www/css/font_awesome',
                    expand: true
                }, {
                    cwd: 'www_src/lib/onsen/css/material-design-iconic-font',
                    src: '**',
                    dest: 'www/css/material-design-iconic-font',
                    expand: true
                }]
            }
        },
        replace: {
            dbCredentials: {
                src: ['www/js/*.js'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: /<%=SERVER_URL%>/g,
                    to: '<%= grunt.option(\"credentials\").backendless.serverUrl %>'
                }, {
                    from: /<%=APPLICATION_ID%>/g,
                    to: '<%= grunt.option(\"credentials\").backendless.applicationId %>'
                }, {
                    from: /<%=JS_SECRET_KEY%>/g,
                    to: '<%= grunt.option(\"credentials\").backendless.jsSecretKey %>'

                }, {
                    from: /<%=REST_SECRET_KEY%>/g,
                    to: '<%= grunt.option(\"credentials\").backendless.restSecretKey %>'

                }, {
                    from: /<%=VERSION%>/g,
                    to: '<%= grunt.option(\"credentials\").backendless.version %>'
                }]
            },
            mapsCredentials: {
                src: ['www/main.html'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: /<%=MAPS_KEY%>/g,
                    to: '<%= grunt.option(\"credentials\").googleMaps.key %>'
                }]
            },
            reportIssue: {
                src: ['www/templates/menu.html'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: /<%=REPORT_ISSUE%>/g,
                    to: '<%= grunt.option(\"reportIssue\") %>'
                }]
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'target/war/css',
                    src: ['style.css'],
                    dest: 'target/war/css',
                    ext: '.min.css'
                }]
            }
        },
        'file-creator': {
            version_prod: {
                "www/js/version.js": function (fs, fd, done) {
                    var pkg = grunt.file.readJSON('package.json');
                    var version = pkg.version + "." + buildNumber;
                    fs.writeSync(fd, "var version = '" + version + "';");
                    done();
                }
            },
            version_dev: {
                "www/js/version.js": function (fs, fd, done) {
                    fs.writeSync(fd, "var version = '" + buildTimestamp + "';");
                    done();
                }
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                forin: true,
                freeze: true,
                //maxparams: 1,
                noarg: true,
                nocomma: true,
                nonbsp: true,
                nonew: true,
                unused: true,
                undef: true,
                futurehostile: true,
                latedef: true,
                maxcomplexity: 5,
                browser: true,
                reporter: 'checkstyle',
                reporterOutput: 'target/jshint-result.xml'
            },
            all: ['src/main/js/**/*.js']
        },
        less: {
            compile: {
                files: {
                    'www/css/less.css': ['www_src/style/less/circle.less', 'www_src/style/less/mixins.less']
                }
            }
        },
        sass: {
            dist: {
                files: {
                    'www/css/lib.css': 'www_src/lib/onsen/css/onsenui.scss'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-file-creator');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('setCredentials', 'asdfg', function(t) {
		var credentials = grunt.file.readJSON('credentials.json');
        if (t === 'alpha') {
            global.credentials = credentials.alpha;
        } else if (t === 'prod') {
            global.credentials = credentials.prod;
        }  else if (t === 'dev_local') {
            global.credentials = credentials.dev_local;
        } else if (t === 'dev') {
            global.credentials = credentials.dev;
        } else {
            global.credentials = credentials.dev;
        }
        grunt.option("credentials", global.credentials);
    });

    grunt.registerTask('setReportIssue', 'asdfg', function(t) {
        if (t === 'alpha') {
            global.reportIssue = true;
        } else if (t === 'prod') {
            global.reportIssue = false;
        } else {
            global.reportIssue = true;
        }
        grunt.option("reportIssue", global.reportIssue);
    });

    grunt.registerTask('delete', ['clean']);
    grunt.registerTask('dev_local', ['clean', 'setCredentials:dev_local', 'setReportIssue:dev_local', 'copy', 'file-creator:version_dev', 'concat', 'replace', 'less:compile', 'sass', 'clean:version']);
    grunt.registerTask('dev', ['clean', 'setCredentials:dev', 'setReportIssue:dev', 'copy', 'file-creator:version_dev', 'concat', 'replace', 'less:compile', 'sass', 'clean:version']);
	grunt.registerTask('alpha', ['clean', 'setCredentials:alpha', 'setReportIssue:alpha', 'copy', 'file-creator:version_prod', 'concat', 'replace', 'less:compile', 'sass', 'clean:version']);
	grunt.registerTask('prod', ['clean', 'setCredentials:prod', 'setReportIssue:prod', 'copy', 'file-creator:version_prod', 'concat', 'replace', 'less:compile', 'sass', 'clean:version']);
    grunt.registerTask('default', ['dev']);
};
