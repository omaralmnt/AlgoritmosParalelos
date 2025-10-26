<?php

namespace App;

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    /**
     * Override cache directory to use /tmp in Lambda (read-only filesystem)
     */
    public function getCacheDir(): string
    {
        if (isset($_SERVER['LAMBDA_TASK_ROOT'])) {
            return '/tmp/cache/' . $this->environment;
        }

        return parent::getCacheDir();
    }

    /**
     * Override log directory to use /tmp in Lambda (read-only filesystem)
     */
    public function getLogDir(): string
    {
        if (isset($_SERVER['LAMBDA_TASK_ROOT'])) {
            return '/tmp/log';
        }

        return parent::getLogDir();
    }
}
