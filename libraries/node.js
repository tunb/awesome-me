/// <reference path="./vfs.ts" />
/// <reference path="../types/vfs.ts" />
/// <reference path="../types/env.ts" />
{
    var getStackTrace = function () { return new Error().stack; };
    var selfAny_1 = self;
    var env_1;
    var errAny = function (e) { throw e; };
    var err_1 = function (message, code) {
        var e = new Error(message);
        if (code)
            e.code = code;
        throw e;
    };
    var errNotImpl_1 = function () { return err_1("not implemented"); };
    // rescue required browser/worker-specific globals
    var URL_1 = selfAny_1.URL;
    var Blob_1 = selfAny_1.Blob;
    var postMessage_1 = selfAny_1.postMessage;
    var XMLHttpRequest_1 = selfAny_1.XMLHttpRequest;
    var exit = selfAny_1.close;
    var setInterval_1 = selfAny_1.setInterval;
    var clearInterval_1 = selfAny_1.clearInterval;
    var setTimeout_1 = selfAny_1.setTimeout;
    var clearTimeout_1 = selfAny_1.clearTimeout;
    var TextDecoder_1 = selfAny_1.TextDecoder;
    var TextEncoder_1 = selfAny_1.TextEncoder;
    var crypto_1 = selfAny_1.crypto;
    var arr2str_1 = function (arr) { return new TextDecoder_1().decode(arr); };
    var console_1 = selfAny_1.console;
    var writeBack_1 = function (absolutePath, content) {
        postMessage_1({ f: "WRITE", x: { path: absolutePath, content: content } });
    };
    var isDirIndicator_1 = function (absolutePath) { return "<title>Index of " + absolutePath; };
    var isDir_1 = function (absolutePath, buffer) { return !!buffer && arr2str_1(buffer).includes(isDirIndicator_1(absolutePath)); };
    var rawReadHttpServer_1 = function (absolutePath) {
        var request = new XMLHttpRequest_1();
        request.responseType = "arraybuffer";
        request.open('GET', absolutePath, false);
        request.send(null);
        if (request.status === 200) {
            writeBack_1(absolutePath, request.response);
            return new Uint8Array(request.response);
        }
        return undefined;
    };
    var throwENOENT_1 = function (absolutePath) { return err_1("ENOENT: no such file or directory, scandir '" + absolutePath + "'", "ENOENT"); };
    var throwENOTDIR_1 = function (absolutePath) { return err_1("ENOTDIR: not a directory, scandir '" + absolutePath + "'", "ENOTDIR"); };
    var readFileSync_1 = function (absolutePath) {
        // - try vfs
        {
            if (absolutePath in env_1.fs)
                return env_1.fs[absolutePath] === null
                    ? err_1("TODO: correct message")
                    : (env_1.fs[absolutePath] === undefined
                        ? throwENOENT_1(absolutePath)
                        : env_1.fs[absolutePath]);
        }
        // - try server
        if (!("__NOHTTP" in env_1.fs)) {
            var result = rawReadHttpServer_1(absolutePath) || throwENOENT_1(absolutePath);
            if (isDir_1(absolutePath, result))
                err_1("TODO: correct message");
            return env_1.fs[absolutePath] = result;
        }
        // - fail
        return throwENOENT_1(absolutePath);
    };
    var readDirSync_1 = function (absolutePath) {
        // evidence for file-ness?
        if (absolutePath in env_1.fs && env_1.fs[absolutePath] !== null && env_1.fs[absolutePath] !== undefined)
            throwENOTDIR_1(absolutePath);
        var envFsExists = Object.keys(env_1.fs).some(function (x) { return x.startsWith(absolutePath); });
        // known files?
        var files = Object.keys(env_1.fs)
            .filter(function (x) { return x.startsWith(absolutePath + '/'); })
            .map(function (x) { return x.slice(absolutePath.length + 1); })
            .filter(function (x) { return !x.includes('/'); });
        // - try server
        if (!("__NOHTTP" in env_1.fs)) {
            var result = rawReadHttpServer_1(absolutePath);
            if (result !== undefined) {
                if (!isDir_1(absolutePath, result))
                    throwENOTDIR_1(absolutePath);
                // add files
                var raw = arr2str_1(result);
                var matches = raw.match(/>[^<>]+<\/a><\/td>/g) || [];
                matches = matches.map(function (x) { return x.slice(1, -9); });
                matches = matches.map(function (x) { return x.endsWith('/') ? x.slice(0, -1) : x; });
                matches = matches.filter(function (x) { return x !== ".."; });
                files.push.apply(files, matches);
            }
            else if (!envFsExists)
                throwENOENT_1(absolutePath);
        }
        // normalize
        files = files.sort();
        files = files.filter(function (f, i) { return i === 0 || f !== files[i - 1]; });
        return files;
    };
    var existsFolderSync_1 = function (absolutePath) {
        try {
            return Array.isArray(readDirSync_1(absolutePath));
        }
        catch (_a) {
            return false;
        }
    };
    var existsSync_1 = function (absolutePath) {
        try {
            readFileSync_1(absolutePath);
            return true;
        }
        catch (_a) {
            return false;
        }
    };
    var join = function (basePath, relative) {
        var path = basePath + '/' + relative;
        function normalizeArray(parts) {
            var up = 0;
            for (var i = parts.length - 1; i >= 0; i--) {
                var last = parts[i];
                if (last === '.') {
                    parts.splice(i, 1);
                }
                else if (last === '..') {
                    parts.splice(i, 1);
                    up++;
                }
                else if (up) {
                    parts.splice(i, 1);
                    up--;
                }
            }
            return parts;
        }
        path = normalizeArray(path.split('/').filter(function (p) { return !!p; })).join('/');
        return '/' + path;
    };
    // ENTRY POINT
    selfAny_1.onmessage = function (msg) {
        if (msg.data.type !== "start")
            return;
        env_1 = msg.data.env;
        // BOOT
        var nativesKeys = [
            'internal/bootstrap_node',
            'async_hooks',
            'assert',
            'buffer',
            'child_process',
            'console',
            'constants',
            'crypto',
            'cluster',
            'dgram',
            'dns',
            'domain',
            'events',
            'fs',
            'http',
            '_http_agent',
            '_http_client',
            '_http_common',
            '_http_incoming',
            '_http_outgoing',
            '_http_server',
            'https',
            'inspector',
            'module',
            'net',
            'os',
            'path',
            'perf_hooks',
            'process',
            'punycode',
            'querystring',
            'readline',
            'repl',
            'stream',
            '_stream_readable',
            '_stream_writable',
            '_stream_duplex',
            '_stream_transform',
            '_stream_passthrough',
            '_stream_wrap',
            'string_decoder',
            'sys',
            'timers',
            'tls',
            '_tls_common',
            '_tls_legacy',
            '_tls_wrap',
            'tty',
            'url',
            'util',
            'v8',
            'vm',
            'zlib',
            'internal/buffer',
            'internal/child_process',
            'internal/cluster/child',
            'internal/cluster/master',
            'internal/cluster/round_robin_handle',
            'internal/cluster/shared_handle',
            'internal/cluster/utils',
            'internal/cluster/worker',
            // 'internal/crypto/certificate',
            // 'internal/crypto/cipher',
            // 'internal/crypto/diffiehellman',
            // 'internal/crypto/hash',
            // 'internal/crypto/pbkdf2',
            // 'internal/crypto/random',
            // 'internal/crypto/sig',
            // 'internal/crypto/util',
            'internal/encoding',
            'internal/errors',
            'internal/freelist',
            'internal/fs',
            'internal/http',
            'internal/inspector_async_hook',
            'internal/linkedlist',
            'internal/loader/Loader',
            'internal/loader/ModuleJob',
            'internal/loader/ModuleMap',
            'internal/loader/ModuleWrap',
            'internal/loader/resolveRequestUrl',
            'internal/loader/search',
            'internal/net',
            'internal/module',
            'internal/os',
            'internal/process',
            'internal/process/next_tick',
            'internal/process/promises',
            'internal/process/stdio',
            'internal/process/warning',
            'internal/process/write-coverage',
            'internal/querystring',
            'internal/readline',
            'internal/repl',
            'internal/safe_globals',
            'internal/socket_list',
            'internal/test/unicode',
            'internal/url',
            'internal/util',
            'internal/v8_prof_polyfill',
            'internal/v8_prof_processor',
            'internal/streams/lazy_transform',
            'internal/streams/BufferList',
            'internal/streams/legacy',
            'internal/streams/destroy'
        ];
        var natives = {};
        for (var _i = 0, nativesKeys_1 = nativesKeys; _i < nativesKeys_1.length; _i++) {
            var nativesKey = nativesKeys_1[_i];
            natives[nativesKey] = arr2str_1(readFileSync_1("/libraries/node/" + nativesKey + ".js") || err_1("missing native '" + nativesKey + "'"));
        }
        natives["config"] = '\n{"target_defaults":{"cflags":[],"default_configuration":"Release","defines":[],"include_dirs":[],"libraries":[]},"variables":{"asan":0,"coverage":false,"debug_devtools":"node","force_dynamic_crt":0,"host_arch":"x64","icu_data_file":"icudt59l.dat","icu_data_in":"..\\\\..\\\\deps/icu-small\\\\source/data/in\\\\icudt59l.dat","icu_endianness":"l","icu_gyp_path":"tools/icu/icu-generic.gyp","icu_locales":"en,root","icu_path":"deps/icu-small","icu_small":true,"icu_ver_major":"59","node_byteorder":"little","node_enable_d8":false,"node_enable_v8_vtunejit":false,"node_install_npm":true,"node_module_version":57,"node_no_browser_globals":false,"node_prefix":"/usr/local","node_release_urlbase":"https://nodejs.org/download/release/","node_shared":false,"node_shared_cares":false,"node_shared_http_parser":false,"node_shared_libuv":false,"node_shared_openssl":false,"node_shared_zlib":false,"node_tag":"","node_use_bundled_v8":true,"node_use_dtrace":false,"node_use_etw":true,"node_use_lttng":false,"node_use_openssl":true,"node_use_perfctr":true,"node_use_v8_platform":true,"node_without_node_options":false,"openssl_fips":"","openssl_no_asm":0,"shlib_suffix":"so.57","target_arch":"x64","v8_enable_gdbjit":0,"v8_enable_i18n_support":1,"v8_enable_inspector":1,"v8_no_strict_aliasing":1,"v8_optimized_debug":0,"v8_promise_internal_field_count":1,"v8_random_seed":0,"v8_use_snapshot":true,"want_separate_host_toolset":0,"want_separate_host_toolset_mkpeephole":0}}'
            .replace(/"/g, "'");
        //env.fs["__NOHTTP"] = null;
        var newContext = function (target) {
            if (target === void 0) { target = {}; }
            return new Proxy(target, {
                has: function () { return true; },
                get: function (_, k) {
                    if (k in target)
                        return target[k];
                    if (typeof k === "string" && /^[_a-zA-Z]+$/.test(k)) {
                        try {
                            return eval(k);
                        }
                        catch (e) {
                            if (e instanceof ReferenceError)
                                return undefined; // TODO: this is a workaround for `typeof ...` - would throw ReferenceError otherwise! :(
                            throw e;
                        }
                    }
                    return eval(k);
                }
            });
        };
        var theContext = newContext({});
        var ContextifyScript = /** @class */ (function () {
            function ContextifyScript(code, options) {
                this.code = code;
                this.options = options;
            }
            ContextifyScript.prototype.runInThisContext = function () {
                // try {
                // sinful code
                return eval("(() => { with (theContext) { return eval(this.code + `\\n//# sourceURL=${this.options.filename}`); } })()");
                // } catch (e) {
                //   console.log('error', e)
                // }
            };
            return ContextifyScript;
        }());
        var ChannelWrap = /** @class */ (function () {
            function ChannelWrap() {
            }
            return ChannelWrap;
        }());
        var TTY = /** @class */ (function () {
            function TTY(fd, unknown) {
                var _this = this;
                this._fd = fd;
                this._unknown = unknown;
                _handleWrapQueue.push(this);
                if (fd === 0) {
                    var onChar_1 = function (c) {
                        //if (this.reading) {
                        var buffer = new TextEncoder_1().encode(c);
                        _this.onread(buffer.length, buffer);
                        // }
                    };
                    selfAny_1.onmessage = function (msg) {
                        if (msg.data.type !== "stdin")
                            return;
                        onChar_1(msg.data.ch);
                        _this.owner.emit("keypress", msg.data.ch, msg.data.key);
                    };
                }
            }
            TTY.prototype.getWindowSize = function (size) {
                size[0] = 120; // cols
                size[1] = 30; // rows
            };
            TTY.prototype.readStart = function () {
            };
            TTY.prototype.readStop = function () {
            };
            TTY.prototype.setBlocking = function (blocking) {
            };
            TTY.prototype.setRawMode = function (rawMode) {
            };
            TTY.prototype.writeAsciiString = function (req, data) { errNotImpl_1(); };
            TTY.prototype.writeBuffer = function (req, data) { errNotImpl_1(); };
            TTY.prototype.writeLatin1String = function (req, data) { errNotImpl_1(); };
            TTY.prototype.writeUcs2String = function (req, data) { errNotImpl_1(); };
            TTY.prototype.writeUtf8String = function (req, data) {
                switch (this._fd) {
                    case 1: // stdout
                        postMessage_1({ f: "stdout", x: data });
                        break;
                    case 2: // stderr
                        postMessage_1({ f: "stderr", x: data });
                        break;
                }
            };
            TTY.prototype.close = function () {
                _handleWrapQueue.splice(_handleWrapQueue.indexOf(this), 1);
            };
            return TTY;
        }());
        var _handleWrapQueue = [];
        var startTime = Date.now();
        var Timer = /** @class */ (function () {
            function Timer() {
                this.__handle = null;
                _handleWrapQueue.push(this);
            }
            Object.defineProperty(Timer, "kOnTimeout", {
                get: function () {
                    return 0;
                },
                enumerable: true,
                configurable: true
            });
            Timer.now = function () {
                return Date.now() - startTime;
            };
            Timer.prototype.start = function (delay) {
                var _this = this;
                if (this.__handle === null)
                    this.__handle = setInterval_1(function () { return _this[Timer.kOnTimeout](); }, delay);
            };
            Timer.prototype.stop = function () {
                if (this.__handle !== null)
                    clearInterval_1(this.__handle);
            };
            Timer.prototype.close = function () {
                _handleWrapQueue.splice(_handleWrapQueue.indexOf(this), 1);
            };
            Timer.prototype.unref = function () {
                // TODO
            };
            return Timer;
        }());
        var TCP = /** @class */ (function () {
            function TCP() {
            }
            return TCP;
        }());
        var ShutdownWrap = /** @class */ (function () {
            function ShutdownWrap() {
            }
            return ShutdownWrap;
        }());
        var WriteWrap = /** @class */ (function () {
            function WriteWrap() {
            }
            return WriteWrap;
        }());
        var PerformanceEntry = /** @class */ (function () {
            function PerformanceEntry() {
            }
            return PerformanceEntry;
        }());
        var HTTPParser = /** @class */ (function () {
            function HTTPParser() {
            }
            HTTPParser.prototype.reinitialize = function (_) {
            };
            HTTPParser.RESPONSE = 0;
            return HTTPParser;
        }());
        var FSReqWrap = /** @class */ (function () {
            function FSReqWrap() {
            }
            return FSReqWrap;
        }());
        var cwd = "/mnt";
        var statValues = new Float64Array([
            1458881089,
            33207,
            1,
            0,
            0,
            0,
            -1,
            8162774324649504,
            58232,
            -1,
            1484478676521.9932,
            1506412651257.9966,
            1506412651257.9966,
            1484478676521.9932,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ]);
        var global = self;
        global.global = global;
        var runMicrotasks = function () {
            var proc = process;
            if (proc._needImmediateCallback)
                proc._immediateCallback();
            else {
                if (_handleWrapQueue.length === 0)
                    proc.exit(0);
            }
        };
        var nextTick = function (cb) { return process.nextTick(cb); };
        var process = {
            _getActiveHandles: function () { return _handleWrapQueue.map(function (x) { return x.owner || x; }); },
            _getActiveRequests: function () { return []; },
            _rawDebug: function (x) { return postMessage_1({ f: "error", x: { f: "_rawDebug", x: x } }); },
            _setupDomainUse: function (domain, stack) { return []; },
            _setupProcessObject: function (pushValueToArrayFunction) { },
            _setupPromises: function () { },
            _setupNextTick: function (_tickCallback, _runMicrotasks) {
                _runMicrotasks.runMicrotasks = runMicrotasks;
                setInterval_1(_tickCallback, 1); // teardown implicit?
                return [0, 0];
            },
            argv: ["node"].concat(msg.data.args),
            binding: function (name) {
                switch (name) {
                    case "async_wrap":
                        return {
                            clearIdStack: function () { },
                            asyncIdStackSize: function () { },
                            pushAsyncIds: function () { },
                            popAsyncIds: function () { },
                            async_hook_fields: [0],
                            async_uid_fields: [0],
                            constants: {
                                kInit: 0,
                                kBefore: 1,
                                kAfter: 2,
                                kDestroy: 3,
                                kPromiseResolve: 4,
                                kTotals: 5,
                                kFieldsCount: 6,
                                kAsyncUidCntr: 0,
                                kCurrentAsyncId: 0,
                                kInitTriggerId: 0,
                            },
                            setupHooks: function () { }
                        }; // TODO
                    case "buffer":
                        return {
                            byteLengthUtf8: function (s) {
                                return s.length; // TODO
                            },
                            setupBufferJS: function (proto) {
                                proto.utf8Slice = function (start, end) {
                                    var slice = this.slice(start, end);
                                    return new TextDecoder_1().decode(slice);
                                };
                                proto.hexSlice = function (start, end) {
                                    var slice = this.slice(start, end);
                                    var result = "";
                                    for (var i = 0; i < slice.byteLength; ++i)
                                        result += slice[i].toString(16);
                                    return result;
                                };
                                proto.utf8Write = function (string, offset, length) {
                                    // TODO
                                    for (var i = 0; i < length && i < this.byteLength - offset; ++i)
                                        this[i + offset] = string.charCodeAt(i);
                                    return i;
                                };
                            }
                        }; // TODO
                    case "cares_wrap":
                        return {
                            GetAddrInfoReqWrap: function () { },
                            GetNameInfoReqWrap: function () { },
                            QueryReqWrap: function () { },
                            ChannelWrap: ChannelWrap,
                            isIP: function () { },
                            getaddrinfo: function (addr_info_wrap, hostname, family, hints, verbatim) {
                                addr_info_wrap.oncomplete({ 0: 0, 1: [addr_info_wrap.hostname] });
                                return 0; // = success
                            }
                        }; // TODO
                    case "config":
                        return {}; // TODO
                    case "constants":
                        return JSON.parse('{"os":{"UV_UDP_REUSEADDR":4,"errno":{"E2BIG":7,"EACCES":13,"EADDRINUSE":100,"EADDRNOTAVAIL":101,"EAFNOSUPPORT":102,"EAGAIN":11,"EALREADY":103,"EBADF":9,"EBADMSG":104,"EBUSY":16,"ECANCELED":105,"ECHILD":10,"ECONNABORTED":106,"ECONNREFUSED":107,"ECONNRESET":108,"EDEADLK":36,"EDESTADDRREQ":109,"EDOM":33,"EEXIST":17,"EFAULT":14,"EFBIG":27,"EHOSTUNREACH":110,"EIDRM":111,"EILSEQ":42,"EINPROGRESS":112,"EINTR":4,"EINVAL":22,"EIO":5,"EISCONN":113,"EISDIR":21,"ELOOP":114,"EMFILE":24,"EMLINK":31,"EMSGSIZE":115,"ENAMETOOLONG":38,"ENETDOWN":116,"ENETRESET":117,"ENETUNREACH":118,"ENFILE":23,"ENOBUFS":119,"ENODATA":120,"ENODEV":19,"ENOENT":2,"ENOEXEC":8,"ENOLCK":39,"ENOLINK":121,"ENOMEM":12,"ENOMSG":122,"ENOPROTOOPT":123,"ENOSPC":28,"ENOSR":124,"ENOSTR":125,"ENOSYS":40,"ENOTCONN":126,"ENOTDIR":20,"ENOTEMPTY":41,"ENOTSOCK":128,"ENOTSUP":129,"ENOTTY":25,"ENXIO":6,"EOPNOTSUPP":130,"EOVERFLOW":132,"EPERM":1,"EPIPE":32,"EPROTO":134,"EPROTONOSUPPORT":135,"EPROTOTYPE":136,"ERANGE":34,"EROFS":30,"ESPIPE":29,"ESRCH":3,"ETIME":137,"ETIMEDOUT":138,"ETXTBSY":139,"EWOULDBLOCK":140,"EXDEV":18,"WSAEINTR":10004,"WSAEBADF":10009,"WSAEACCES":10013,"WSAEFAULT":10014,"WSAEINVAL":10022,"WSAEMFILE":10024,"WSAEWOULDBLOCK":10035,"WSAEINPROGRESS":10036,"WSAEALREADY":10037,"WSAENOTSOCK":10038,"WSAEDESTADDRREQ":10039,"WSAEMSGSIZE":10040,"WSAEPROTOTYPE":10041,"WSAENOPROTOOPT":10042,"WSAEPROTONOSUPPORT":10043,"WSAESOCKTNOSUPPORT":10044,"WSAEOPNOTSUPP":10045,"WSAEPFNOSUPPORT":10046,"WSAEAFNOSUPPORT":10047,"WSAEADDRINUSE":10048,"WSAEADDRNOTAVAIL":10049,"WSAENETDOWN":10050,"WSAENETUNREACH":10051,"WSAENETRESET":10052,"WSAECONNABORTED":10053,"WSAECONNRESET":10054,"WSAENOBUFS":10055,"WSAEISCONN":10056,"WSAENOTCONN":10057,"WSAESHUTDOWN":10058,"WSAETOOMANYREFS":10059,"WSAETIMEDOUT":10060,"WSAECONNREFUSED":10061,"WSAELOOP":10062,"WSAENAMETOOLONG":10063,"WSAEHOSTDOWN":10064,"WSAEHOSTUNREACH":10065,"WSAENOTEMPTY":10066,"WSAEPROCLIM":10067,"WSAEUSERS":10068,"WSAEDQUOT":10069,"WSAESTALE":10070,"WSAEREMOTE":10071,"WSASYSNOTREADY":10091,"WSAVERNOTSUPPORTED":10092,"WSANOTINITIALISED":10093,"WSAEDISCON":10101,"WSAENOMORE":10102,"WSAECANCELLED":10103,"WSAEINVALIDPROCTABLE":10104,"WSAEINVALIDPROVIDER":10105,"WSAEPROVIDERFAILEDINIT":10106,"WSASYSCALLFAILURE":10107,"WSASERVICE_NOT_FOUND":10108,"WSATYPE_NOT_FOUND":10109,"WSA_E_NO_MORE":10110,"WSA_E_CANCELLED":10111,"WSAEREFUSED":10112},"signals":{"SIGHUP":1,"SIGINT":2,"SIGILL":4,"SIGABRT":22,"SIGFPE":8,"SIGKILL":9,"SIGSEGV":11,"SIGTERM":15,"SIGBREAK":21,"SIGWINCH":28}},"fs":{"O_RDONLY":0,"O_WRONLY":1,"O_RDWR":2,"S_IFMT":61440,"S_IFREG":32768,"S_IFDIR":16384,"S_IFCHR":8192,"S_IFLNK":40960,"O_CREAT":256,"O_EXCL":1024,"O_TRUNC":512,"O_APPEND":8,"F_OK":0,"R_OK":4,"W_OK":2,"X_OK":1},"crypto":{"SSL_OP_ALL":2147486719,"SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION":262144,"SSL_OP_CIPHER_SERVER_PREFERENCE":4194304,"SSL_OP_CISCO_ANYCONNECT":32768,"SSL_OP_COOKIE_EXCHANGE":8192,"SSL_OP_CRYPTOPRO_TLSEXT_BUG":2147483648,"SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS":2048,"SSL_OP_EPHEMERAL_RSA":0,"SSL_OP_LEGACY_SERVER_CONNECT":4,"SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER":32,"SSL_OP_MICROSOFT_SESS_ID_BUG":1,"SSL_OP_MSIE_SSLV2_RSA_PADDING":0,"SSL_OP_NETSCAPE_CA_DN_BUG":536870912,"SSL_OP_NETSCAPE_CHALLENGE_BUG":2,"SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG":1073741824,"SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG":8,"SSL_OP_NO_COMPRESSION":131072,"SSL_OP_NO_QUERY_MTU":4096,"SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION":65536,"SSL_OP_NO_SSLv2":16777216,"SSL_OP_NO_SSLv3":33554432,"SSL_OP_NO_TICKET":16384,"SSL_OP_NO_TLSv1":67108864,"SSL_OP_NO_TLSv1_1":268435456,"SSL_OP_NO_TLSv1_2":134217728,"SSL_OP_PKCS1_CHECK_1":0,"SSL_OP_PKCS1_CHECK_2":0,"SSL_OP_SINGLE_DH_USE":1048576,"SSL_OP_SINGLE_ECDH_USE":524288,"SSL_OP_SSLEAY_080_CLIENT_DH_BUG":128,"SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG":0,"SSL_OP_TLS_BLOCK_PADDING_BUG":512,"SSL_OP_TLS_D5_BUG":256,"SSL_OP_TLS_ROLLBACK_BUG":8388608,"ENGINE_METHOD_RSA":1,"ENGINE_METHOD_DSA":2,"ENGINE_METHOD_DH":4,"ENGINE_METHOD_RAND":8,"ENGINE_METHOD_ECDH":16,"ENGINE_METHOD_ECDSA":32,"ENGINE_METHOD_CIPHERS":64,"ENGINE_METHOD_DIGESTS":128,"ENGINE_METHOD_STORE":256,"ENGINE_METHOD_PKEY_METHS":512,"ENGINE_METHOD_PKEY_ASN1_METHS":1024,"ENGINE_METHOD_ALL":65535,"ENGINE_METHOD_NONE":0,"DH_CHECK_P_NOT_SAFE_PRIME":2,"DH_CHECK_P_NOT_PRIME":1,"DH_UNABLE_TO_CHECK_GENERATOR":4,"DH_NOT_SUITABLE_GENERATOR":8,"NPN_ENABLED":1,"ALPN_ENABLED":1,"RSA_PKCS1_PADDING":1,"RSA_SSLV23_PADDING":2,"RSA_NO_PADDING":3,"RSA_PKCS1_OAEP_PADDING":4,"RSA_X931_PADDING":5,"RSA_PKCS1_PSS_PADDING":6,"RSA_PSS_SALTLEN_DIGEST":-1,"RSA_PSS_SALTLEN_MAX_SIGN":-2,"RSA_PSS_SALTLEN_AUTO":-2,"POINT_CONVERSION_COMPRESSED":2,"POINT_CONVERSION_UNCOMPRESSED":4,"POINT_CONVERSION_HYBRID":6,"defaultCoreCipherList":"ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA","defaultCipherList":"ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA"},"zlib":{"Z_NO_FLUSH":0,"Z_PARTIAL_FLUSH":1,"Z_SYNC_FLUSH":2,"Z_FULL_FLUSH":3,"Z_FINISH":4,"Z_BLOCK":5,"Z_OK":0,"Z_STREAM_END":1,"Z_NEED_DICT":2,"Z_ERRNO":-1,"Z_STREAM_ERROR":-2,"Z_DATA_ERROR":-3,"Z_MEM_ERROR":-4,"Z_BUF_ERROR":-5,"Z_VERSION_ERROR":-6,"Z_NO_COMPRESSION":0,"Z_BEST_SPEED":1,"Z_BEST_COMPRESSION":9,"Z_DEFAULT_COMPRESSION":-1,"Z_FILTERED":1,"Z_HUFFMAN_ONLY":2,"Z_RLE":3,"Z_FIXED":4,"Z_DEFAULT_STRATEGY":0,"ZLIB_VERNUM":4784,"DEFLATE":1,"INFLATE":2,"GZIP":3,"GUNZIP":4,"DEFLATERAW":5,"INFLATERAW":6,"UNZIP":7,"Z_MIN_WINDOWBITS":8,"Z_MAX_WINDOWBITS":15,"Z_DEFAULT_WINDOWBITS":15,"Z_MIN_CHUNK":64,"Z_MAX_CHUNK":null,"Z_DEFAULT_CHUNK":16384,"Z_MIN_MEMLEVEL":1,"Z_MAX_MEMLEVEL":9,"Z_DEFAULT_MEMLEVEL":8,"Z_MIN_LEVEL":-1,"Z_MAX_LEVEL":9,"Z_DEFAULT_LEVEL":-1}}');
                    case "contextify":
                        return {
                            ContextifyScript: ContextifyScript
                        }; // TODO
                    case "crypto":
                        return {
                            randomBytes: function (size, cb) {
                                var rawBytes = new Uint8Array(size);
                                if (size > 0)
                                    crypto_1.getRandomValues(rawBytes);
                                var bytes = Buffer.from(rawBytes.buffer);
                                if (typeof cb === 'function')
                                    return global.process.nextTick(function () { return cb(null, bytes); });
                                return bytes;
                            },
                            randomFill: function (bytes, offset, size, cb) {
                                var rawBytes = new Uint8Array(size);
                                if (size > 0)
                                    crypto_1.getRandomValues(rawBytes);
                                for (var i = 0; i < size; ++i)
                                    bytes[offset + i] = rawBytes[i];
                                if (typeof cb === 'function')
                                    return global.process.nextTick(function () { return cb(null, bytes); }); // guess
                                return bytes;
                            },
                        }; // TODO
                    case "fs":
                        var wrap_1 = function (f, req) {
                            var result = undefined;
                            var err = undefined;
                            try {
                                result = f();
                            }
                            catch (e) {
                                err = e;
                            }
                            if (req)
                                nextTick(function () { return req.oncomplete(err, result); });
                            else if (err)
                                throw err;
                            return result;
                        };
                        var fstat_1 = function (fd, req) {
                            if (fd !== undefined) {
                                statValues[1] =
                                    (0xF000 & ((fd.isDir ? 4 : 8) << 12)) |
                                        (0x0FFF & 0x1B7 /*no clue*/);
                                statValues[8] = fd.s.byteLength;
                            }
                            // TODO
                            if (req)
                                nextTick(function () { return req.oncomplete( /*error, if one happened*/); });
                        };
                        return {
                            getStatValues: function () { return statValues; },
                            internalModuleReadFile: function (path) {
                                try {
                                    var res = readFileSync_1(path);
                                    return arr2str_1(res);
                                }
                                catch (_a) {
                                    return undefined;
                                }
                            },
                            internalModuleStat: function (path) {
                                // dir
                                if (existsFolderSync_1(path))
                                    return 1;
                                // file
                                if (existsSync_1(path))
                                    return 0;
                                return -4058;
                            },
                            fstat: fstat_1,
                            lstat: function (path, req) {
                                try {
                                    try {
                                        var buffer = readFileSync_1(path);
                                        if (buffer)
                                            return fstat_1({ s: buffer, isDir: false }, req);
                                    }
                                    catch (_a) { }
                                    if (readDirSync_1(path))
                                        return fstat_1({ s: new Uint8Array(0), isDir: true }, req);
                                    err_1("TODO: correct error treatment");
                                }
                                catch (_b) {
                                    fstat_1(undefined, req);
                                    return;
                                }
                            },
                            stat: function (path, req) {
                                try {
                                    try {
                                        var buffer = readFileSync_1(path);
                                        if (buffer)
                                            return fstat_1({ s: buffer, isDir: false }, req);
                                    }
                                    catch (_a) { }
                                    if (readDirSync_1(path))
                                        return fstat_1({ s: new Uint8Array(0), isDir: true }, req);
                                    err_1("TODO: correct error treatment");
                                }
                                catch (_b) {
                                    fstat_1(undefined, req);
                                    return;
                                }
                            },
                            open: function (path, flags, mode, req) {
                                return wrap_1(function () {
                                    if (flags === 0)
                                        return { s: readFileSync_1(path), isDir: false };
                                    if (flags === 266)
                                        return { s: readFileSync_1(path), isDir: false };
                                    return errNotImpl_1();
                                }, req);
                            },
                            close: function (fd, req) {
                                wrap_1(function () { return undefined; }, req);
                            },
                            read: function (fd, buffer, offset, length, position, req) {
                                return wrap_1(function () {
                                    var s = fd.s;
                                    var copy = Math.min(s.length, length);
                                    for (var i = 0; i < copy; ++i)
                                        buffer[offset + i] = s[i];
                                    fd.s = s.slice(copy);
                                    return copy;
                                }, req);
                            },
                            readdir: function (path, encoding, req) {
                                return wrap_1(function () { return readDirSync_1(path); }, req);
                            },
                            mkdir: function (path, mode, req) {
                                return wrap_1(function () {
                                    try {
                                        readDirSync_1(path);
                                    }
                                    catch (_a) {
                                        env_1.fs[path] = null;
                                        return undefined;
                                    }
                                    return err_1("EXISTS");
                                }, req);
                            },
                            FSReqWrap: FSReqWrap
                        }; // TODO
                    case "fs_event_wrap":
                        return {}; // TODO
                    case "http_parser":
                        return {
                            methods: [],
                            HTTPParser: HTTPParser
                        }; // TODO
                    case "inspector":
                        return {}; // TODO
                    case "os":
                        return {
                            getCPUs: function () { return errNotImpl_1(); },
                            getFreeMem: function () { return errNotImpl_1(); },
                            getHomeDirectory: function () { return '/home/runner'; },
                            getHostname: function () { return errNotImpl_1(); },
                            getInterfaceAddresses: function () { return errNotImpl_1(); },
                            getLoadAvg: function () { return errNotImpl_1(); },
                            getOSRelease: function () { return "4.4.0-66-generic"; },
                            getOSType: function () { return "Linux"; },
                            getTotalMem: function () { return errNotImpl_1(); },
                            getUserInfo: function () { return [{
                                    uid: 1001,
                                    gid: 1001,
                                    username: 'runner',
                                    homedir: '/home/runner',
                                    shell: '/bin/bash'
                                }][0]; },
                            getUptime: function () { return errNotImpl_1(); },
                            isBigEndian: false
                        }; // TODO
                    case "performance":
                        return {
                            constants: {
                                NODE_PERFORMANCE_ENTRY_TYPE_NODE: 0,
                                NODE_PERFORMANCE_ENTRY_TYPE_MARK: 0,
                                NODE_PERFORMANCE_ENTRY_TYPE_MEASURE: 0,
                                NODE_PERFORMANCE_ENTRY_TYPE_GC: 0,
                                NODE_PERFORMANCE_ENTRY_TYPE_FUNCTION: 0,
                                NODE_PERFORMANCE_MILESTONE_NODE_START: 0,
                                NODE_PERFORMANCE_MILESTONE_V8_START: 0,
                                NODE_PERFORMANCE_MILESTONE_LOOP_START: 0,
                                NODE_PERFORMANCE_MILESTONE_LOOP_EXIT: 0,
                                NODE_PERFORMANCE_MILESTONE_BOOTSTRAP_COMPLETE: 0,
                                NODE_PERFORMANCE_MILESTONE_ENVIRONMENT: 0,
                                NODE_PERFORMANCE_MILESTONE_THIRD_PARTY_MAIN_START: 0,
                                NODE_PERFORMANCE_MILESTONE_THIRD_PARTY_MAIN_END: 0,
                                NODE_PERFORMANCE_MILESTONE_CLUSTER_SETUP_START: 0,
                                NODE_PERFORMANCE_MILESTONE_CLUSTER_SETUP_END: 0,
                                NODE_PERFORMANCE_MILESTONE_MODULE_LOAD_START: 0,
                                NODE_PERFORMANCE_MILESTONE_MODULE_LOAD_END: 0,
                                NODE_PERFORMANCE_MILESTONE_PRELOAD_MODULE_LOAD_START: 0,
                                NODE_PERFORMANCE_MILESTONE_PRELOAD_MODULE_LOAD_END: 0
                            },
                            // mark: _mark,
                            markMilestone: function () { },
                            // measure: _measure,
                            // milestones,
                            observerCounts: {},
                            PerformanceEntry: PerformanceEntry,
                            setupObservers: function () { },
                        }; // TODO
                    case "pipe_wrap":
                        return {}; // TODO
                    case "process_wrap":
                        return {}; // TODO
                    case "module_wrap":
                        return {}; // TODO
                    case "natives":
                        return natives;
                    case "spawn_sync":
                        return {
                            spawn: function () { return errNotImpl_1(); }
                        };
                    case "stream_wrap":
                        return {
                            ShutdownWrap: ShutdownWrap,
                            WriteWrap: WriteWrap
                        }; // TODO
                    case "tcp_wrap":
                        return {
                            TCP: TCP
                        }; // TODO
                    case "timer_wrap":
                        return {
                            Timer: Timer
                        }; // TODO
                    case "tty_wrap":
                        return {
                            isTTY: function () { return true; },
                            guessHandleType: function (fs) { return "TTY"; },
                            TTY: TTY
                        }; // TODO
                    case "udp_wrap":
                        return {}; // TODO
                    case "url":
                        return {
                            parse: function () { },
                            encodeAuth: function () { },
                            toUSVString: function () { },
                            domainToASCII: function () { },
                            domainToUnicode: function () { },
                            setURLConstructor: function () { },
                            URL_FLAGS_NONE: 0, URL_FLAGS_FAILED: 1, URL_FLAGS_CANNOT_BE_BASE: 2, URL_FLAGS_INVALID_PARSE_STATE: 4, URL_FLAGS_TERMINATED: 8, URL_FLAGS_SPECIAL: 16, URL_FLAGS_HAS_USERNAME: 32, URL_FLAGS_HAS_PASSWORD: 64, URL_FLAGS_HAS_HOST: 128, URL_FLAGS_HAS_PATH: 256, URL_FLAGS_HAS_QUERY: 512, URL_FLAGS_HAS_FRAGMENT: 1024,
                            kSchemeStart: 0, kScheme: 1, kNoScheme: 2, kSpecialRelativeOrAuthority: 3, kPathOrAuthority: 4, kRelative: 5, kRelativeSlash: 6, kSpecialAuthoritySlashes: 7, kSpecialAuthorityIgnoreSlashes: 8, kAuthority: 9, kHost: 10, kHostname: 11, kPort: 12, kFile: 13, kFileSlash: 14, kFileHost: 15, kPathStart: 16, kPath: 17, kCannotBeBase: 18, kQuery: 19, kFragment: 20
                        };
                    case "util":
                        return {
                            getPromiseDetails: function (x) { return x && x.toString(); },
                            getProxyDetails: function (x) { return x && x.toString(); },
                            isAnyArrayBuffer: function (x) { return x instanceof ArrayBuffer; },
                            isUint8Array: function (x) { return x instanceof Uint8Array; },
                            isDataView: function (x) { return x instanceof DataView; },
                            isExternal: function (x) { return false; },
                            isMap: function (x) { return x instanceof Map; },
                            isMapIterator: function (x) { return (x || {}).constructor === new Map().entries().constructor; },
                            isPromise: function (x) { return x instanceof Promise; },
                            isSet: function (x) { return x instanceof Set; },
                            isSetIterator: function (x) { return (x || {}).constructor === new Set().entries().constructor; },
                            isTypedArray: function (x) {
                                return x instanceof Int8Array ||
                                    x instanceof Uint8Array ||
                                    x instanceof Uint8ClampedArray ||
                                    x instanceof Int16Array ||
                                    x instanceof Uint16Array ||
                                    x instanceof Int32Array ||
                                    x instanceof Uint32Array ||
                                    x instanceof Float32Array ||
                                    x instanceof Float64Array;
                            },
                            isRegExp: function (x) { return x instanceof RegExp; },
                            isDate: function (x) { return x instanceof Date; },
                            // kPending,
                            // kRejected,
                            startSigintWatchdog: function () { },
                            stopSigintWatchdog: function () { },
                            getHiddenValue: function (error, noIdea) { return false; }
                        }; // TODO
                    case "uv":
                        return {
                            errname: function () { return "errname(" + arguments + ")"; },
                            UV_E2BIG: -4093, UV_EACCES: -4092, UV_EADDRINUSE: -4091, UV_EADDRNOTAVAIL: -4090, UV_EAFNOSUPPORT: -4089, UV_EAGAIN: -4088, UV_EAI_ADDRFAMILY: -3000, UV_EAI_AGAIN: -3001, UV_EAI_BADFLAGS: -3002, UV_EAI_BADHINTS: -3013, UV_EAI_CANCELED: -3003, UV_EAI_FAIL: -3004, UV_EAI_FAMILY: -3005, UV_EAI_MEMORY: -3006, UV_EAI_NODATA: -3007, UV_EAI_NONAME: -3008, UV_EAI_OVERFLOW: -3009, UV_EAI_PROTOCOL: -3014, UV_EAI_SERVICE: -3010, UV_EAI_SOCKTYPE: -3011, UV_EALREADY: -4084, UV_EBADF: -4083, UV_EBUSY: -4082, UV_ECANCELED: -4081, UV_ECHARSET: -4080, UV_ECONNABORTED: -4079, UV_ECONNREFUSED: -4078, UV_ECONNRESET: -4077, UV_EDESTADDRREQ: -4076, UV_EEXIST: -4075, UV_EFAULT: -4074, UV_EFBIG: -4036, UV_EHOSTUNREACH: -4073, UV_EINTR: -4072, UV_EINVAL: -4071, UV_EIO: -4070, UV_EISCONN: -4069, UV_EISDIR: -4068, UV_ELOOP: -4067, UV_EMFILE: -4066, UV_EMSGSIZE: -4065, UV_ENAMETOOLONG: -4064, UV_ENETDOWN: -4063, UV_ENETUNREACH: -4062, UV_ENFILE: -4061, UV_ENOBUFS: -4060, UV_ENODEV: -4059, UV_ENOENT: -4058, UV_ENOMEM: -4057, UV_ENONET: -4056, UV_ENOPROTOOPT: -4035, UV_ENOSPC: -4055, UV_ENOSYS: -4054, UV_ENOTCONN: -4053, UV_ENOTDIR: -4052, UV_ENOTEMPTY: -4051, UV_ENOTSOCK: -4050, UV_ENOTSUP: -4049, UV_EPERM: -4048, UV_EPIPE: -4047, UV_EPROTO: -4046, UV_EPROTONOSUPPORT: -4045, UV_EPROTOTYPE: -4044, UV_ERANGE: -4034, UV_EROFS: -4043, UV_ESHUTDOWN: -4042, UV_ESPIPE: -4041, UV_ESRCH: -4040, UV_ETIMEDOUT: -4039, UV_ETXTBSY: -4038, UV_EXDEV: -4037, UV_UNKNOWN: -4094, UV_EOF: -4095, UV_ENXIO: -4033, UV_EMLINK: -4032, UV_EHOSTDOWN: -4031
                        };
                    default:
                        throw new Error("missing binding '" + name + "'");
                }
            },
            chdir: function (target) { cwd = require("path").resolve(cwd, target); },
            cwd: function () { return cwd; },
            env: {
                // NODE_NO_READLINE: 1
                NODE_REPL_HISTORY: '//',
                NODE_REPL_HISTORY_FILE: '//'
                // NODE_DEBUG: "repl,timer,stream,esm,module,net"
            },
            execPath: "/libraries/node.js",
            moduleLoadList: [],
            pid: 42,
            reallyExit: function (exitCode) {
                postMessage_1({ f: "EXIT", x: exitCode });
                while (true)
                    ; // TODO smarter spin wait? maybe some sync-IO stuff?
                // don't allow any further execution (not caller, but also no timers etc.)
            },
            release: {
                name: "node-box"
            },
            umask: function () { return 0; },
            version: "v8.0.0",
            versions: {
                http_parser: '2.7.0',
                node: '8.0.0',
                v8: '5.8.283.41',
                uv: '1.11.0',
                zlib: '1.2.11',
                ares: '1.10.1-DEV',
                modules: '57',
                openssl: '1.0.2k',
                icu: '59.1',
                unicode: '9.0',
                cldr: '31.0.1',
                tz: '2017b'
            }
        };
        Object.setPrototypeOf(process, {});
        var bootstrapper = new ContextifyScript(natives["internal/bootstrap_node"], { displayErrors: true, filename: "internal/bootstrap_node", lineOffset: 0 });
        var bootstrap = bootstrapper.runInThisContext();
        try {
            bootstrap(process);
        }
        catch (e) {
            console_1.error(e);
        }
    };
    selfAny_1.onerror = function (ev) { postMessage_1({ f: "error", x: ev }); };
}
// function 
