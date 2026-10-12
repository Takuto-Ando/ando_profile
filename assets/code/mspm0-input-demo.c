#include "ti_msp_dl_config.h"
#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>

volatile uint32_t event_count = 0;
volatile bool uart_update = true;

static void uart_send_string(const char *str)
{
    while (*str != '\0')
    {
        DL_UART_Main_transmitDataBlocking(
            UART_PC_INST,
            *str);

        str++;
    }
}

int main(void)
{
    char buffer[64];

    SYSCFG_DL_init();

    NVIC_ClearPendingIRQ(GPIO_SWITCHES_INT_IRQN);
    NVIC_EnableIRQ(GPIO_SWITCHES_INT_IRQN);

    uart_send_string("\r\n=== MSPM0 Industrial Input Demo ===\r\n");

    while (1)
    {
        if (uart_update)
        {
            uart_update = false;

            sprintf(
                buffer,
                "EVENT COUNT = %lu\r\n",
                (unsigned long)event_count
            );

            uart_send_string(buffer);
        }

        __WFI();
    }
}

void GPIOA_IRQHandler(void)
{
    uint32_t status;

    status = DL_GPIO_getEnabledInterruptStatus(
        GPIO_SWITCHES_PORT,
        GPIO_SWITCHES_USER_SWITCH_1_PIN);

    if (status & GPIO_SWITCHES_USER_SWITCH_1_PIN)
    {
        DL_GPIO_clearInterruptStatus(
            GPIO_SWITCHES_PORT,
            GPIO_SWITCHES_USER_SWITCH_1_PIN);

        bool state =
            DL_GPIO_readPins(
                GPIO_SWITCHES_PORT,
                GPIO_SWITCHES_USER_SWITCH_1_PIN);

        if (state)
        {
            event_count++;

            DL_GPIO_clearPins(
                GPIO_LEDS_PORT,
                GPIO_LEDS_USER_LED_1_PIN);

            uart_update = true;
        }
        else
        {
            DL_GPIO_setPins(
                GPIO_LEDS_PORT,
                GPIO_LEDS_USER_LED_1_PIN);
        }
    }
}
