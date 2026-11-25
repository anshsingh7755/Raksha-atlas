package com.raksha.common;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

class PageResponseTest {
    @Test
    void mapsPageMetadataWithoutLosingItems() {
        var page = new PageImpl<>(List.of("a", "b"), PageRequest.of(1, 2), 5);
        var response = PageResponse.from(page);
        assertThat(response.items()).containsExactly("a", "b");
        assertThat(response.page()).isEqualTo(1);
        assertThat(response.size()).isEqualTo(2);
        assertThat(response.totalItems()).isEqualTo(5);
        assertThat(response.totalPages()).isEqualTo(3);
        assertThat(response.hasPrevious()).isTrue();
        assertThat(response.hasNext()).isTrue();
    }
}
