module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            target: ["www/**/*"]
        },
        concat: {
            js: {
                src: ['www_src/js/**/*.js'],
                dest: 'www/js/crowd.js'
            },
            css: {
                src: ['www_src/style/css/*.css'],
                dest: 'www/css/crowd.css'
            },
            less: {
                src: ['www_src/style/less/*.less'],
                dest: 'www/css/crowd.less'
            },
            libjs: {
                src: ['www_src/lib/angular/angular.min.js',
                    'www_src/lib/angular/angular-resource.min.js',
                    'www_src/lib/angular/ready.js',
                    'www_src/lib/angular/filesystem.js',
                    'www_src/lib/angular/connection.js',
                    'www_src/lib/angular/geolocation.js',
                    'www_src/lib/onsen/js/onsenui.min.js',
                    'www_src/lib/backendless/backendless.min.js',
                    'www_src/lib/less/less.min.js'
                ],
                dest: 'www/js/lib.js'
            },
            libcss: {
                src: ['www_src/lib/onsen/css/onsenui.css', 'www_src/lib/onsen/css/onsen-css-components.min.css'],
                dest: 'www/css/lib.css'
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
                }]
            }
        },
        replace: {
            dbCredentials: {
                src: ['www/js/crowd.js'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: /<%=APPLICATION_ID%>/g,
                    to: '<%= grunt.option(\"credentials\").backendless.applicationId %>'
                }, {
                    from: /<%=SECRET_KEY%>/g,
                    to: '<%= grunt.option(\"credentials\").backendless.secretKey %>'

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
        ngtemplates: {
            app: {
                cwd: 'src/main/js',
                src: '**/*.html',
                dest: 'target/war/templates/templates.js',
                options: {
                    prefix: 'templates',
                    htmlmin: {
                        collapseWhitespace: true,
                        removeEmptyAttributes: true
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.registerTask('setCredentials', 'asdfg', function(t) {
		var credentials = grunt.file.readJSON('credentials.json');
        if (t === 'alpha') {
            global.credentials = credentials.alpha;
        } else if (t === 'prod') {
            global.credentials = credentials.prod;
        } else {
            global.credentials = credentials.dev;
        }
        grunt.option("credentials", global.credentials);
    });
    grunt.registerTask('delete', ['clean']);
    grunt.registerTask('dev', ['clean', 'setCredentials:dev', 'concat', 'copy', 'replace']);
	grunt.registerTask('alpha', ['clean', 'setCredentials:alpha', 'concat', 'copy', 'replace']);
	grunt.registerTask('prod', ['clean', 'setCredentials:prod', 'concat', 'copy', 'replace']);
};
