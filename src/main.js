import styles from './sass/main.scss';
import { Core } from './services/core';
import Cors from './services/cors';
import { PointCluster } from './components/PointCluser';

// Exporting Cors lib because it's useful.
window.Cors = Cors

// Exporting PointCluster Object to window for global use.
window.PointCluster = PointCluster;
