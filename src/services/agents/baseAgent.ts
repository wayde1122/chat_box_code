/**
 * Agent 基类
 * 定义所有 Agent 的公共接口和行为
 */

/** Agent 执行结果 */
export interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  /** 执行耗时（毫秒） */
  duration: number;
}

/** Agent 基类 */
export abstract class BaseAgent<TInput, TOutput> {
  /** Agent 名称 */
  abstract readonly name: string;
  /** Agent 描述 */
  abstract readonly description: string;

  /**
   * 执行 Agent 任务
   * @param input 输入参数
   * @returns 执行结果
   */
  async execute(input: TInput): Promise<AgentResult<TOutput>> {
    const startTime = performance.now();
    
    try {
      console.log(`[${this.name}] 开始执行...`);
      const data = await this.run(input);
      const duration = Math.round(performance.now() - startTime);
      
      console.log(`[${this.name}] 执行完成，耗时 ${duration}ms`);
      
      return {
        success: true,
        data,
        duration,
      };
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      
      console.error(`[${this.name}] 执行失败: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }

  /**
   * 子类实现的具体执行逻辑
   * @param input 输入参数
   * @returns 输出结果
   */
  protected abstract run(input: TInput): Promise<TOutput>;
}

