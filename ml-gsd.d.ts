import type {DataXY} from 'cheminfo-types';
export {DataXY} from 'cheminfo-types';

export interface GSDOptions {
  /**
   * Noise threshold in spectrum y units. Default is three/thresholdFactor times the absolute median of data.y.
   * @default `median(data.y) * (options.thresholdFactor || 3)`
   */
  noiseLevel?: number;
  /**
   * Threshold to determine if a given GSDPeak should be considered as a noise, bases on its relative height compared to the highest GSDPeak.
   * @default 0.01
   */
  minMaxRatio?: number;
  /**
   * If broadRatio is higher than 0, then all the GSDPeaks which second derivative smaller than broadRatio * maxAbsSecondDerivative will be marked with the soft mask equal to true.
   * @default 0.00025
   */
  broadRatio?: number;
  /**
   * Select the GSDPeak intensities from a smoothed version of the independent variables.
   * @default true
   */
  smoothY?: boolean;
  /**
   * if it is true, it optimizes the x and intensity by extrapolation.
   * @default false
   */
  realTopDetection?: boolean;
  /**
   * options to shape used to adapt the FWHM
   * @default {kind:'gaussian'}
   */
  shape?: { kind: string };
  /**
   * Options for savitz Golay
   */
  sgOptions?: { windowSize: number; polynomial: number };
  /**
   * filter based on intensity of the first derive.
   * @default -1
   */
  /**
   * GSDPeaks are local maximum(true) or minimum(false)
   * @default true
   */
  maxCriteria?: boolean;
  /**
   * Filters based on the amplitude of the first derivative
   * @default -1
   */
  derivativeThreshold?: number;
  /**
   * Factor to multiply the calculated height (usually 2)
   * @default 0
   */
  heightFactor?: number;
}

export interface GSDPeak {
  index: number;
  x: number;
  y: number;
  width: number;
  left?: {
    x?:number,
    index?:number,
  };
  right?: {
    x?:number,
    index?:number,
  };
  base?: number;
  soft?: boolean;
  kind?: string;
}

export interface OptimizeGSDPeaksOptions {
  /**
   * factor to determine the width at the moment to group the GSDPeaks in signals in 'GSD.optimizeGSDPeaks' function.
   * @default 1
   */
  factorWidth?: number;
  /**
   * times of width to use to optimize GSDPeaks
   * @default 2
   */
  factorLimits?: number;
  /**
   * options to shape used to adapt the FWHM
   * @default {kind:'gaussian'}
   */
  shape?: { kind: string };
  /**
   * options for optimization step
   */
  optimization?: OptimizationOptions;
}

export interface OptimizationOptions {
  /**
   * represent the algorithm to optimize.
   * @default {kind:'lm'}
   */
  kind?: string;
  /**
   * Time limit to stop the optimization in seconds.
   * @default 10
   */
  timeout?: number;
}

export interface OptimizedGSDPeak {
  x: number;
  y: number;
  width: number;
  mu?: number;
}

export function gsd(data: DataXY, options?: GSDOptions): GSDPeak[];

export function optimizeGSDPeaks(
  data: DataXY,
  PeakList: GSDPeak[],
  options?: OptimizeGSDPeaksOptions,
): OptimizedGSDPeak[];

export function joinBroadGSDPeaks(
  PeakList: GSDPeak[],
  options?: JoinBroadGSDPeaksOptions,
): GSDPeak[];

export interface JoinBroadGSDPeaksOptions {
  /**
   * @default 0.25
   */
  width: number;
  /**
   * @default { kind: 'gaussian' }
   */
  shape: { kind: string };
  /**
   * @default { kind: 'lm', timeout: 10 }
   */
  optimization: OptimizationOptions;
}

export function groupGSDPeaks(PeakList: GSDPeak[], factor?: number): GSDPeak[][];

export function broadenGSDPeaks(
  PeakList: GSDPeak[],
  options?: {
    /**
     * @default 2
     */
    factor: number;
    /**
     * @default false
     */
    overlap: boolean;
  },
): GSDPeak[];
