package com.raksha.common;

import java.time.Duration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.cache.annotation.EnableCaching;

@Configuration
@EnableCaching
@ConditionalOnProperty(name = "raksha.cache.redis-enabled", havingValue = "true")
public class RedisCacheConfiguration {

    @Bean
    CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        org.springframework.data.redis.cache.RedisCacheConfiguration defaults = org.springframework.data.redis.cache.RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5))
                .disableCachingNullValues();
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaults)
                .build();
    }
}
