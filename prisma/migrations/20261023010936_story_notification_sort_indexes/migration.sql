-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Story_status_publishedAt_idx" ON "Story"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Story_status_likeCount_idx" ON "Story"("status", "likeCount");

-- CreateIndex
CREATE INDEX "Story_status_viewCount_idx" ON "Story"("status", "viewCount");

-- CreateIndex
CREATE INDEX "Story_status_bookmarkCount_idx" ON "Story"("status", "bookmarkCount");
