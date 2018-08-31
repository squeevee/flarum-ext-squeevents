<?php

// 'Squeevents' source code
// (c) 2018 Ellie Hawk "@squeevee"

namespace Squeevee\Squeevents;

use Flarum\Event\ConfigureWebApp;
use Flarum\Foundation\Application;
use Illuminate\Contracts\Events\Dispatcher;
use MatthiasMullie\Minify;

class ConfigureWebAppListener
{
    private $app;

    public function __construct(Application $app)
    {
        $this->app = $app;
    }

    public function subscribe(Dispatcher $events)
    {
        $events->listen(ConfigureWebApp::class, [$this, 'configureWebApp']);
    }

    public function configureWebApp(ConfigureWebApp $event)
    {
        if ($event->isForum())
        {
            $headerScript = file_get_contents(__DIR__ . '/js/header.js');
            if ($this->app->inDebugMode())
            {
                $event->view->addHeadString('<script>' . $headerScript . '</script>');
                $event->view->addHeadString('<script>/*debug mode*/ window.squeevents.enable_log=true;</script>');
            }
            else
            {
                $minifier = new Minify\JS($headerScript);
                $event->view->addHeadString('<script>' . $minifier->minify() . '</script>');
            }

            $event->addAssets([__DIR__ . '/js/extension.js']);
            $event->addBootstrapper('squeevee/squeevents/main');
        }
    }
}

return function (Dispatcher $events) {
    $events->subscribe(ConfigureWebAppListener::class);
};
